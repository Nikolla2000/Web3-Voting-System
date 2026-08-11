import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthProxyService } from "./auth-proxy.service";
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "./decorators/public.decorator";
import type { Request, Response } from 'express';
import { firstValueFrom, timeout } from "rxjs";
import { ClientProxy } from "@nestjs/microservices";
import { AUTH_PATTERNS, AuthResponse, AuthTokens, LoginDto, RegisterDto, USERS_PATTERNS } from "@app/shared";
import { JwtService } from "@nestjs/jwt";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { JwtPayload } from "./strategies/jwt.strategy";
import { UpdateUserDto } from "@app/shared/users/dto/update-user.dto";

@ApiTags('Auth')
@Controller()
export class AuthProxyController {
    constructor(
        private readonly configService: ConfigService,
        private readonly authProxyService: AuthProxyService,
        private readonly jwtService: JwtService,
        @Inject('IDENTITY_SERVICE') private readonly authClient: ClientProxy,
    ) {}

    @Public()
    @Post('auth/register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    async register(
      @Body() dto: RegisterDto,
      @Res({ passthrough: true }) res: Response
    ) {
      const data = await this.send<AuthResponse>(AUTH_PATTERNS.REGISTER, dto);
      this.setRefreshCookie(res, data.tokens.refreshToken)
      return { user: data.user, accessToken: data.tokens.accessToken }
    }

    @Public()
    @Post('auth/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user with email and password' })
    async login(
      @Body() dto: LoginDto,
      @Res({ passthrough: true }) res: Response
    ) {
      const data = await this.send<AuthResponse>(AUTH_PATTERNS.LOGIN, dto);
      this.setRefreshCookie(res, data.tokens.refreshToken);
      return { user: data.user, accessToken: data.tokens.accessToken };
    }

    @Public()
    @Post('auth/refresh')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Refresh access token' })
    async refresh(
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response
    ) {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is missing');
      }

      let payload: JwtPayload;
      try {
        payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        });
      } catch (error) {
        throw new UnauthorizedException('Refresh token is invalid or expired');
      }

      const data = await this.send<AuthTokens>(AUTH_PATTERNS.REFRESH, {
        userId: payload.sub,
        refreshToken
      });
      this.setRefreshCookie(res, data.refreshToken);
      return { accessToken: data.accessToken };
    }

    @Post('auth/logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout current session' })
    async logout(
      @CurrentUser() user: JwtPayload,
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response
    ) {
      const refreshToken = req.cookies?.refreshToken;
      const data = await this.send(AUTH_PATTERNS.LOGOUT, { userId: user.sub, refreshToken });
      const isProd = this.configService.get<string>('app.nodeEnv') === 'production';
  
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax' as const,
        path: '/'
      });
      return data;
    }

    @Post('auth/logout-all')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout from all devices' })
    async logoutAll(
      @CurrentUser() user: JwtPayload,
      @Res({ passthrough: true }) res: Response
    ) {
      const data = await this.send(AUTH_PATTERNS.LOGOUT_ALL, { userId: user.sub });
      const isProd = this.configService.get<string>('app.nodeEnv') === 'production';
  
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax' as const,
        path: '/'
      });
      return data;
    }

    @Get('users/me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current authenticated user' })
    async getMe(@CurrentUser() user: JwtPayload) {  
      return this.send(USERS_PATTERNS.GET_ME, { userId: user.sub });
    }
    
    @Get('users/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by ID' })
    async findOne(@Param('id') id: string) {
      return this.send(USERS_PATTERNS.FIND_BY_ID, { userId: id });
    }
  
    @Patch('users/me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user profile' })
    async updateMe(
      @CurrentUser() user: JwtPayload,
      @Body() dto: UpdateUserDto,
    ) {
      return this.send(USERS_PATTERNS.UPDATE_ME, { userId: user.sub, dto });
    }


    /**
     * ClientProxy.send() wrapper
     * @param firstValueFrom converts Observable to Promise 
     * @param timeout - 10 secs, to save from hanging requests if identity service doesn't respond 
     * @returns 
     */
    private async send<T>(pattern: string, payload: unknown): Promise<T> {
      return firstValueFrom(
      this.authClient
          .send<T>({ cmd: pattern }, payload)
          .pipe(timeout(10000)),
      );
    }

    private setRefreshCookie(res: Response, refreshToken: string): void {
      const isProd = this.configService.get<string>('app.nodeEnv') === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        // path: '/api/auth/refresh'
      });
    }
}
