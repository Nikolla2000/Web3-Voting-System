import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { RegisterDto } from "@app/shared/auth/dto/register.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto extends PartialType(RegisterDto) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  walletAddress?: string;
}