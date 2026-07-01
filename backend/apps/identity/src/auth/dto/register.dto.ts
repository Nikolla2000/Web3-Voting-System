import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: 'ivan_stoyanov' })
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers and underscores',
    })
    username: string;

    @ApiProperty({ example: 'ivan_stoyanov@gmail.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'somePass123!' })
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter and one number',
    })
    password: string;
}