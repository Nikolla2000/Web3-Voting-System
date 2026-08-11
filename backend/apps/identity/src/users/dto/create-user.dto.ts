import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: 'some_user' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'some_user@gmail.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}