import { IsEmail, IsString, isString } from "class-validator";

export class LoginDto {

  @IsString()
  @IsEmail()
  username: string;

  @IsString()
  password: string;
}