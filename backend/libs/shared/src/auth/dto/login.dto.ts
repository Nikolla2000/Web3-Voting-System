import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: 'ivan_stoyanov@gmail.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'somePass123!' })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    password: string;
}