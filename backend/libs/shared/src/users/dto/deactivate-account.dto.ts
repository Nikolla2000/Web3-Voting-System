import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeactivateAccountDto {
  // Required only if the account has a password set — Google-only accounts
  // have nothing to verify against.
  @ApiPropertyOptional({ description: 'Required only if the account already has a password set' })
  @IsString()
  @IsOptional()
  password?: string;
}
