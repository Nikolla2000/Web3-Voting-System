import { Controller } from "@nestjs/common";
// import { AuthService } from "./auth.service";
// import { UsersService } from "../users/users.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuthService } from "./auth.service";
import { AUTH_PATTERNS, AuthResponse, RegisterDto, LoginDto } from "@app/shared";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

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

  @MessagePattern({ cmd: AUTH_PATTERNS.LOGIN })
  async login(@Payload() dto: LoginDto) {
    const { user, tokens } = await this.authService.login(dto);

    return {
      user,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
    }
  }

  @MessagePattern({ cmd: AUTH_PATTERNS.REFRESH })
  async refresh(@Payload() payload: { userId: string, refreshToken: string }) {
    const tokens = await this.authService.refresh(payload.userId, payload.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

}