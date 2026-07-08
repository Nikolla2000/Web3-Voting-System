import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: 'ivan_stoyanov@gmail.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'somePass123!' })
    @IsString()
    @MinLength(8)
    password: string;
}