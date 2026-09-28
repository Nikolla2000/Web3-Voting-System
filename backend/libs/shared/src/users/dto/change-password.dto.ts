import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  // Omitted entirely for a Google-only account that has no password yet —
  // the service only requires/verifies it when the user already has one.
  @ApiPropertyOptional({ description: 'Required only if the account already has a password set' })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ example: 'somePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  newPassword: string;
}
