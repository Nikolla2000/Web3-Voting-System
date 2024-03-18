import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { UserSevice } from 'src/users/user.service';
import { LoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserSevice,
    private authService: AuthService
    ) {}

  @Post('register')
  async registerUser(@Body () dto: CreateUserDto) {
    return await this.userService.createTestTwo(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }
}
