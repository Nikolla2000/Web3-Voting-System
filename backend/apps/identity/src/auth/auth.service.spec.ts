import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ROUTING_KEYS } from '@app/shared';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mirrors AuthService's own hashRefreshToken — refresh tokens are hashed
// with SHA-256 (not bcrypt; see that method's comment for why), and that's
// real, unmocked crypto here, not a mock to configure.
function sha256(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// PrismaService's real module pulls in Prisma's generated client, which this
// app's generator ("prisma-client", ESM-flavored TS output) emits using
// `import.meta` — a syntax ts-jest's CommonJS transform can't parse. Unit
// tests never touch the real client anyway (every DB call is mocked), so
// the module is stubbed out before anything imports it transitively.
jest.mock('apps/identity/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AuthService } from './auth.service';
import { PrismaService } from 'apps/identity/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RabbitMQPublisherService } from '../rabbitmq/rabbitmq.service';
import { Role } from '../generated/prisma/enums';

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected promise to reject');
}

/**
 * Covers AuthService — the actual authentication surface: credential
 * checking on login, refresh-token rotation, and Google find-or-create.
 * Prisma/UsersService/JwtService/RabbitMQ are all mocked; bcrypt is mocked
 * for password verification (login) but NOT for refresh-token hashing,
 * which uses real SHA-256 (see auth.service.ts's hashRefreshToken) — real
 * crypto there is what catches the truncation-collision class of bug.
 */
describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    refreshToken: {
      create: jest.Mock;
      findMany: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let usersService: {
    create: jest.Mock;
    findByEmail: jest.Mock;
    findByUsername: jest.Mock;
    findById: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock };
  let configService: { get: jest.Mock };
  let rabbitMQService: { publish: jest.Mock };

  const baseUser = {
    id: 'user-1',
    email: 'voter@example.com',
    username: 'voter',
    avatar: null,
    role: Role.USER,
    isActive: true,
    password: 'hashed-password',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      refreshToken: {
        create: jest.fn().mockResolvedValue(undefined),
        findMany: jest.fn(),
        delete: jest.fn().mockResolvedValue(undefined),
        deleteMany: jest.fn().mockResolvedValue(undefined),
      },
    };
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
    };
    configService = { get: jest.fn().mockReturnValue('config-value') };
    rabbitMQService = { publish: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: RabbitMQPublisherService, useValue: rabbitMQService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('creates the user, issues tokens, persists the refresh token, and publishes USER_REGISTERED', async () => {
      usersService.create.mockResolvedValue({
        id: baseUser.id,
        email: baseUser.email,
        username: baseUser.username,
        avatar: baseUser.avatar,
        role: baseUser.role,
      });

      const result = await service.register({
        email: baseUser.email,
        username: baseUser.username,
        password: 'plaintext',
      });

      expect(result.tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(result.user).toEqual({
        id: baseUser.id,
        email: baseUser.email,
        username: baseUser.username,
        avatar: baseUser.avatar,
        role: baseUser.role,
      });

      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          token: sha256('refresh-token'),
          userId: baseUser.id,
        }),
      });

      expect(rabbitMQService.publish).toHaveBeenCalledWith(
        ROUTING_KEYS.USER_REGISTERED,
        expect.objectContaining({
          userId: baseUser.id,
          email: baseUser.email,
          username: baseUser.username,
          registeredViaGoogle: false,
        }),
      );
    });
  });

  describe('login', () => {
    it('rejects when no user exists for the email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const error = await catchError(
        service.login({ email: 'nobody@example.com', password: 'x' }),
      );

      expect(error).toBeInstanceOf(RpcException);
      expect((error as RpcException).getError()).toMatchObject({
        message: 'Invalid credentials',
      });
    });

    it('rejects a deactivated account even with correct credentials', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...baseUser,
        isActive: false,
      });

      const error = await catchError(
        service.login({ email: baseUser.email, password: 'x' }),
      );

      expect((error as RpcException).getError()).toMatchObject({
        message: 'Account is deactivated',
      });
    });

    it('rejects a Google-only account (no password set) with a dedicated message', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...baseUser,
        password: null,
      });

      const error = await catchError(
        service.login({ email: baseUser.email, password: 'x' }),
      );

      expect((error as RpcException).getError()).toMatchObject({
        message: 'This account uses Google sign-in. Please login with Google.',
      });
    });

    it('rejects an incorrect password without revealing which check failed', async () => {
      usersService.findByEmail.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const error = await catchError(
        service.login({ email: baseUser.email, password: 'wrong' }),
      );

      expect((error as RpcException).getError()).toMatchObject({
        message: 'Invalid credentials',
      });
    });

    it('issues tokens and persists a refresh token on correct credentials', async () => {
      usersService.findByEmail.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: baseUser.email,
        password: 'correct',
      });

      expect(result.tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      // Login is not a registration event.
      expect(rabbitMQService.publish).not.toHaveBeenCalled();
    });
  });

  describe('googleAuth', () => {
    it('logs in an existing account without creating a new user or publishing', async () => {
      usersService.findByEmail.mockResolvedValue(baseUser);

      const result = await service.googleAuth({
        id: 'google-sub-1',
        email: baseUser.email,
        username: 'whatever-google-sends',
        avatar: '',
      });

      expect(usersService.create).not.toHaveBeenCalled();
      expect(rabbitMQService.publish).not.toHaveBeenCalled();
      expect(result.user.id).toBe(baseUser.id);
    });

    it('creates a new account with the Google username when it is free, and publishes with registeredViaGoogle: true', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 'new-user',
        email: 'new@example.com',
        username: 'newvoter',
        avatar: 'https://avatar',
        role: Role.USER,
      });

      await service.googleAuth({
        id: 'google-sub-2',
        email: 'new@example.com',
        username: 'newvoter',
        avatar: 'https://avatar',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'newvoter' }),
      );
      expect(rabbitMQService.publish).toHaveBeenCalledWith(
        ROUTING_KEYS.USER_REGISTERED,
        expect.objectContaining({ registeredViaGoogle: true }),
      );
    });

    it('suffixes the username when the Google-provided one is already taken', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue({ id: 'someone-else' });
      usersService.create.mockResolvedValue({
        id: 'new-user',
        email: 'new@example.com',
        username: 'newvoter_123',
        avatar: null,
        role: Role.USER,
      });

      jest.spyOn(Date, 'now').mockReturnValue(123);

      await service.googleAuth({
        id: 'google-sub-3',
        email: 'new@example.com',
        username: 'newvoter',
        avatar: '',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'newvoter_123' }),
      );
    });
  });

  describe('refresh', () => {
    it('rejects when no stored, non-expired token matches the incoming one', async () => {
      prisma.refreshToken.findMany.mockResolvedValue([
        { id: 'rt-1', token: sha256('some-other-token') },
      ]);

      const error = await catchError(
        service.refresh(baseUser.id, 'incoming-token'),
      );

      expect((error as RpcException).getError()).toMatchObject({
        message: 'Invalid refresh token',
      });
      expect(prisma.refreshToken.delete).not.toHaveBeenCalled();
    });

    it('rotates the token on a match: deletes the old one and issues/stores a new one', async () => {
      prisma.refreshToken.findMany.mockResolvedValue([
        { id: 'rt-1', token: sha256('some-other-token') },
        { id: 'rt-2', token: sha256('incoming-token') },
      ]);
      usersService.findById.mockResolvedValue(baseUser);

      const result = await service.refresh(baseUser.id, 'incoming-token');

      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'rt-2' },
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    // The actual regression this guards: bcrypt previously truncated its
    // input at 72 bytes, so a long token sharing a 72-byte prefix with a
    // stored one (e.g. the same JWT plus a tampered/extended suffix) would
    // incorrectly match. SHA-256 has no such limit.
    it('rejects a token that shares a long common prefix with a stored one but is not identical', async () => {
      const longToken = `${'a'.repeat(100)}-real`;
      const similarButDifferentToken = `${'a'.repeat(100)}-tampered`;
      prisma.refreshToken.findMany.mockResolvedValue([
        { id: 'rt-1', token: sha256(longToken) },
      ]);

      const error = await catchError(
        service.refresh(baseUser.id, similarButDifferentToken),
      );

      expect((error as RpcException).getError()).toMatchObject({
        message: 'Invalid refresh token',
      });
    });
  });

  describe('logout', () => {
    it('deletes only the matching refresh token', async () => {
      prisma.refreshToken.findMany.mockResolvedValue([
        { id: 'rt-1', token: sha256('some-other-token') },
        { id: 'rt-2', token: sha256('incoming-token') },
      ]);

      await service.logout(baseUser.id, 'incoming-token');

      expect(prisma.refreshToken.delete).toHaveBeenCalledTimes(1);
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'rt-2' },
      });
    });

    it('does nothing if no stored token matches', async () => {
      prisma.refreshToken.findMany.mockResolvedValue([
        { id: 'rt-1', token: sha256('some-other-token') },
      ]);

      await service.logout(baseUser.id, 'incoming-token');

      expect(prisma.refreshToken.delete).not.toHaveBeenCalled();
    });
  });

  describe('logoutAll', () => {
    it('deletes every refresh token belonging to the user', async () => {
      await service.logoutAll(baseUser.id);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: baseUser.id },
      });
    });
  });
});
