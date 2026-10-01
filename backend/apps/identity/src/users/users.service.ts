import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'apps/identity/prisma/prisma.service';
import { User } from '../generated/prisma/client';
import { SafeUser } from './users.types';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  R2StorageService,
  RpcBadRequestException,
  RpcUnauthorizedException,
} from '@app/shared';
import { ChangePasswordDto } from '@app/shared/users/dto/change-password.dto';
import { DeactivateAccountDto } from '@app/shared/users/dto/deactivate-account.dto';
import { RequestAvatarUploadDto } from '@app/shared/users/dto/request-avatar-upload.dto';
import { ConfirmAvatarDto } from '@app/shared/users/dto/confirm-avatar.dto';
import { buildObjectKey } from '@app/shared/storage/image-upload.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2StorageService,
  ) {}

  private sanitize(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return { ...safeUser, hasPassword: !!password };
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Email already in use'
          : 'Username is taken',
      );
    }

    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : null;

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    return this.sanitize(user);
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.sanitize(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return this.sanitize(updated);
  }

  // Skips verification entirely for a Google-only account (no password set).
  private async verifyCurrentPassword(
    user: User,
    currentPassword?: string,
  ): Promise<void> {
    if (!user.password) return;

    if (!currentPassword) {
      throw new RpcBadRequestException('Current password is required');
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatch) {
      throw new RpcUnauthorizedException('Current password is incorrect');
    }
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    await this.verifyCurrentPassword(user, dto.currentPassword);

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async deactivate(id: string, dto: DeactivateAccountDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    await this.verifyCurrentPassword(user, dto.password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      }),
      // Deactivating an account should end every active session, not just
      // the one that requested it.
      this.prisma.refreshToken.deleteMany({ where: { userId: id } }),
    ]);
  }

  async requestAvatarUpload(
    id: string,
    dto: RequestAvatarUploadDto,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    const key = buildObjectKey(`avatars/${id}`, dto.contentType);
    const { uploadUrl, publicUrl } = await this.r2.createPresignedUpload(
      key,
      dto.contentType,
      dto.size,
    );

    return { uploadUrl, key, publicUrl };
  }

  async confirmAvatar(id: string, dto: ConfirmAvatarDto): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    // The key is generated server-side per-user in requestAvatarUpload, so a
    // key outside that prefix could only be someone else's — reject it.
    if (!dto.key.startsWith(`avatars/${id}/`)) {
      throw new RpcBadRequestException('Invalid avatar key');
    }

    const exists = await this.r2.objectExists(dto.key);

    if (!exists) {
      throw new RpcBadRequestException(
        'Upload not found — please try again',
      );
    }

    const previousKey = user.avatar
      ? this.r2.keyFromPublicUrl(user.avatar)
      : null;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { avatar: this.r2.getPublicUrl(dto.key) },
    });

    if (previousKey && previousKey !== dto.key) {
      await this.r2.deleteObject(previousKey);
    }

    return this.sanitize(updated);
  }

  async deleteAvatar(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    const previousKey = user.avatar
      ? this.r2.keyFromPublicUrl(user.avatar)
      : null;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { avatar: null },
    });

    if (previousKey) {
      await this.r2.deleteObject(previousKey);
    }

    return this.sanitize(updated);
  }
}
