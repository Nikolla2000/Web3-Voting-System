import { OmitType, PartialType } from '@nestjs/swagger';
import { RegisterDto } from '@app/shared/auth/dto/register.dto';

// Password is deliberately excluded here — changing it goes through the
// dedicated ChangePasswordDto/endpoint, which verifies the current password
// (or lack thereof for Google-only accounts) before accepting a new one.
// Avatar is also excluded — it's only ever set via the presigned-upload +
// confirm flow (RequestAvatarUploadDto / ConfirmAvatarDto), never a raw URL.
export class UpdateUserDto extends PartialType(
  OmitType(RegisterDto, ['password'] as const),
) {}
