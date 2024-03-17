import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { UserSevice } from 'src/users/user.service';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserSevice) {}

  @Post('register')
  async registerUser(@Body () dto: CreateUserDto) {
    return await this.userService.createTestTwo(dto);
  }
}
