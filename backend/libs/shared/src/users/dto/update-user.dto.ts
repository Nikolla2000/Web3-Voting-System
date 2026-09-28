import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { RegisterDto } from '@app/shared/auth/dto/register.dto';
import { IsOptional, IsString } from 'class-validator';

// Password is deliberately excluded here — changing it goes through the
// dedicated ChangePasswordDto/endpoint, which verifies the current password
// (or lack thereof for Google-only accounts) before accepting a new one.
export class UpdateUserDto extends PartialType(
  OmitType(RegisterDto, ['password'] as const),
) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatar?: string;
}
