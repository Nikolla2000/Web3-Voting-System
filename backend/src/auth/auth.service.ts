import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { UserSevice } from 'src/users/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private userService: UserSevice,
    private jwtService: JwtService,
    ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    const payload = {
      username: user.email,
      sub: {
        name: user.name,
      }
    };

    return {
      user,
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: '1h',
          secret: process.env.JwtSecretKey, 

        }),
        refreshTokens: {
            accessToken: await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
            secret: process.env.JwtRefreshToken, 
        }),
      }
    }
  }
}

  async validateUser(dto: LoginDto) {
    const user = await this.userService.getUserByEmail(dto.username);

    if(user && (await compare(dto.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('username or password incorrect');
  }
}
