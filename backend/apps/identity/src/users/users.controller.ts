import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { USERS_PATTERNS } from '@app/shared';
import { ChangePasswordDto } from '@app/shared/users/dto/change-password.dto';
import { DeactivateAccountDto } from '@app/shared/users/dto/deactivate-account.dto';
import { RequestAvatarUploadDto } from '@app/shared/users/dto/request-avatar-upload.dto';
import { ConfirmAvatarDto } from '@app/shared/users/dto/confirm-avatar.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: USERS_PATTERNS.GET_ME })
  async getMe(@Payload() payload: { userId: string }) {
    return this.usersService.findById(payload.userId);
  }

  @MessagePattern({ cmd: USERS_PATTERNS.FIND_BY_ID })
  async findById(@Payload() payload: { userId: string }) {
    return this.usersService.findById(payload.userId);
  }

  @MessagePattern({ cmd: USERS_PATTERNS.UPDATE_ME })
  async updateMe(@Payload() payload: { userId: string; dto: UpdateUserDto }) {
    return this.usersService.update(payload.userId, payload.dto);
  }

  @MessagePattern({ cmd: USERS_PATTERNS.CHANGE_PASSWORD })
  async changePassword(
    @Payload() payload: { userId: string; dto: ChangePasswordDto },
  ) {
    await this.usersService.changePassword(payload.userId, payload.dto);
    return { success: true };
  }

  @MessagePattern({ cmd: USERS_PATTERNS.DEACTIVATE_ME })
  async deactivateMe(
    @Payload() payload: { userId: string; dto: DeactivateAccountDto },
  ) {
    await this.usersService.deactivate(payload.userId, payload.dto);
    return { success: true };
  }

  @MessagePattern({ cmd: USERS_PATTERNS.REQUEST_AVATAR_UPLOAD })
  async requestAvatarUpload(
    @Payload() payload: { userId: string; dto: RequestAvatarUploadDto },
  ) {
    return this.usersService.requestAvatarUpload(payload.userId, payload.dto);
  }

  @MessagePattern({ cmd: USERS_PATTERNS.CONFIRM_AVATAR })
  async confirmAvatar(
    @Payload() payload: { userId: string; dto: ConfirmAvatarDto },
  ) {
    return this.usersService.confirmAvatar(payload.userId, payload.dto);
  }

  @MessagePattern({ cmd: USERS_PATTERNS.DELETE_AVATAR })
  async deleteAvatar(@Payload() payload: { userId: string }) {
    return this.usersService.deleteAvatar(payload.userId);
  }
}
