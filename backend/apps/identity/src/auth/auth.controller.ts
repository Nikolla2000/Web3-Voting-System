import { Controller } from "@nestjs/common";
// import { AuthService } from "./auth.service";
// import { UsersService } from "../users/users.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { AUTH_PATTERNS, AuthResponse } from "@app/shared";

@Controller()
  export class AuthController {
    constructor (
      private readonly authService: AuthService,
    ) {}

    @MessagePattern({ cmd: 'auth.test' })
    async test() {
      return 'test';
    }

    @MessagePattern({ cmd: AUTH_PATTERNS.REGISTER })
    async register(@Payload() dto: RegisterDto): Promise<AuthResponse> {
      const { user, tokens } = await this.authService.register(dto);

      return {
        user,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }
      }
    }
}