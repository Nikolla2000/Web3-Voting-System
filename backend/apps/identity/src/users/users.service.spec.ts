import { Test, TestingModule } from '@nestjs/testing';

import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Same rationale as auth.service.spec.ts: identity's Prisma generator
// ("prisma-client") emits ESM (`import.meta`) that ts-jest can't parse, and
// every DB call here is mocked anyway, so the real module is never loaded.
jest.mock('apps/identity/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { UsersService } from './users.service';
import { PrismaService } from 'apps/identity/prisma/prisma.service';
import { R2StorageService } from '@app/shared';

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected promise to reject');
}

/**
 * Covers UsersService's security-sensitive paths: the Google-only-account
 * branch of password verification (shared by changePassword/deactivate),
 * and the avatar-confirm key-prefix check, which is a real authorization
 * boundary (the key is attacker-controlled input from the confirm payload).
 * Prisma and R2StorageService are mocked — no real DB or bucket involved.
 */
describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    refreshToken: { deleteMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let r2: {
    createPresignedUpload: jest.Mock;
    objectExists: jest.Mock;
    keyFromPublicUrl: jest.Mock;
    getPublicUrl: jest.Mock;
    deleteObject: jest.Mock;
  };

  const userId = 'user-1';
  const baseUser = {
    id: userId,
    email: 'voter@example.com',
    username: 'voter',
    avatar: null as string | null,
    role: 'USER',
    isActive: true,
    password: 'hashed-current-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: { deleteMany: jest.fn() },
      $transaction: jest.fn().mockResolvedValue(undefined),
    };
    r2 = {
      createPresignedUpload: jest.fn(),
      objectExists: jest.fn(),
      keyFromPublicUrl: jest.fn(),
      getPublicUrl: jest.fn(),
      deleteObject: jest.fn().mockResolvedValue(undefined),
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: R2StorageService, useValue: r2 },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('rejects a duplicate email', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...baseUser });

      const error = await catchError(
        service.create({
          email: baseUser.email,
          username: 'someone-else',
          password: 'x',
        }),
      );

      expect(error).toBeInstanceOf(RpcException);
      expect((error as RpcException).getError()).toMatchObject({
        message: 'Email already in use',
      });
    });

    it('rejects a duplicate username when the email differs', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...baseUser });

      const error = await catchError(
        service.create({
          email: 'different@example.com',
          username: baseUser.username,
          password: 'x',
        }),
      );

      expect((error as RpcException).getError()).toMatchObject({
        message: 'Username is taken',
      });
    });

    it('hashes the password and strips it from the returned user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        ...baseUser,
        password: 'hashed-new-password',
      });

      const result = await service.create({
        email: baseUser.email,
        username: baseUser.username,
        password: 'plaintext',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ password: 'hashed-new-password' }),
      });
      expect(result).not.toHaveProperty('password');
      expect(result.hasPassword).toBe(true);
    });

    it('creates a password-less (Google-only) user with hasPassword: false', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ ...baseUser, password: null });

      const result = await service.create({
        email: baseUser.email,
        username: baseUser.username,
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result.hasPassword).toBe(false);
    });
  });

  describe('findById', () => {
    it('throws a 404 when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toBeInstanceOf(
        RpcException,
      );
    });

    it('returns the sanitized user otherwise', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser });

      const result = await service.findById(userId);

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(userId);
    });
  });

  describe('changePassword', () => {
    it('throws a 404 when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, { newPassword: 'NewPass123' }),
      ).rejects.toBeInstanceOf(RpcException);
    });

    it('requires currentPassword when the account already has one', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser });

      const error = await catchError(
        service.changePassword(userId, { newPassword: 'NewPass123' }),
      );

      expect(error).toBeInstanceOf(RpcException);
      expect((error as RpcException).getError()).toMatchObject({
        message: 'Current password is required',
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects an incorrect currentPassword', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const error = await catchError(
        service.changePassword(userId, {
          currentPassword: 'wrong',
          newPassword: 'NewPass123',
        }),
      );

      expect((error as RpcException).getError()).toMatchObject({
        message: 'Current password is incorrect',
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('skips current-password verification entirely for a Google-only account', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, password: null });

      await service.changePassword(userId, { newPassword: 'NewPass123' });

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: 'hashed-new-password' },
      });
    });

    it('sets the new hashed password once the current one checks out', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(userId, {
        currentPassword: 'correct',
        newPassword: 'NewPass123',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: 'hashed-new-password' },
      });
    });
  });

  describe('deactivate', () => {
    it('throws a 404 when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deactivate(userId, {})).rejects.toBeInstanceOf(
        RpcException,
      );
    });

    it('rejects an incorrect password and never deactivates', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const error = await catchError(
        service.deactivate(userId, { password: 'wrong' }),
      );

      expect(error).toBeInstanceOf(RpcException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('deactivates and revokes every refresh token in one transaction', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockReturnValue('update-op');
      prisma.refreshToken.deleteMany.mockReturnValue('delete-op');

      await service.deactivate(userId, { password: 'correct' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: false },
      });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(prisma.$transaction).toHaveBeenCalledWith([
        'update-op',
        'delete-op',
      ]);
    });

    it('skips password verification for a Google-only account', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...baseUser,
        password: null,
      });

      await service.deactivate(userId, {});

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('confirmAvatar', () => {
    it('throws a 404 when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmAvatar(userId, { key: `avatars/${userId}/x.png` }),
      ).rejects.toBeInstanceOf(RpcException);
    });

    it("rejects a key outside this user's avatar prefix — the actual authorization boundary", async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser });

      const error = await catchError(
        service.confirmAvatar(userId, { key: 'avatars/someone-else/x.png' }),
      );

      expect(error).toBeInstanceOf(RpcException);
      expect((error as RpcException).getError()).toMatchObject({
        message: 'Invalid avatar key',
      });
      expect(r2.objectExists).not.toHaveBeenCalled();
    });

    it('rejects a well-prefixed key that was never actually uploaded', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser });
      r2.objectExists.mockResolvedValue(false);

      const error = await catchError(
        service.confirmAvatar(userId, { key: `avatars/${userId}/x.png` }),
      );

      expect((error as RpcException).getError()).toMatchObject({
        message: 'Upload not found — please try again',
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('saves the new avatar and deletes the previous object when they differ', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...baseUser,
        avatar: 'https://cdn.example.com/avatars/user-1/old.png',
      });
      r2.objectExists.mockResolvedValue(true);
      r2.keyFromPublicUrl.mockReturnValue(`avatars/${userId}/old.png`);
      r2.getPublicUrl.mockReturnValue(
        'https://cdn.example.com/avatars/user-1/new.png',
      );
      prisma.user.update.mockResolvedValue({
        ...baseUser,
        avatar: 'https://cdn.example.com/avatars/user-1/new.png',
      });

      const result = await service.confirmAvatar(userId, {
        key: `avatars/${userId}/new.png`,
      });

      expect(result.avatar).toBe(
        'https://cdn.example.com/avatars/user-1/new.png',
      );
      expect(r2.deleteObject).toHaveBeenCalledWith(`avatars/${userId}/old.png`);
    });

    it('does not delete anything when there was no previous avatar', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, avatar: null });
      r2.objectExists.mockResolvedValue(true);
      r2.getPublicUrl.mockReturnValue('https://cdn.example.com/new.png');
      prisma.user.update.mockResolvedValue({ ...baseUser });

      await service.confirmAvatar(userId, { key: `avatars/${userId}/new.png` });

      expect(r2.deleteObject).not.toHaveBeenCalled();
    });
  });

  describe('deleteAvatar', () => {
    it('throws a 404 when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteAvatar(userId)).rejects.toBeInstanceOf(
        RpcException,
      );
    });

    it('clears the avatar and deletes the stored object', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...baseUser,
        avatar: 'https://cdn.example.com/avatars/user-1/old.png',
      });
      r2.keyFromPublicUrl.mockReturnValue(`avatars/${userId}/old.png`);
      prisma.user.update.mockResolvedValue({ ...baseUser, avatar: null });

      await service.deleteAvatar(userId);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { avatar: null },
      });
      expect(r2.deleteObject).toHaveBeenCalledWith(`avatars/${userId}/old.png`);
    });

    it('skips the R2 delete when there was no avatar to begin with', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, avatar: null });
      prisma.user.update.mockResolvedValue({ ...baseUser });

      await service.deleteAvatar(userId);

      expect(r2.deleteObject).not.toHaveBeenCalled();
    });
  });
});
