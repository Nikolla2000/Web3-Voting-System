import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthProxyService } from "./auth-proxy.service";
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "./decorators/public.decorator";
import type { Request, Response } from 'express';
import { firstValueFrom, timeout } from "rxjs";
import { ClientProxy } from "@nestjs/microservices";
import { AUTH_PATTERNS, AuthResponse, LoginDto, RegisterDto } from "@app/shared";

@ApiTags('Auth')
@Controller()
export class AuthProxyController {
    constructor(
        private readonly configService: ConfigService,
        private readonly authProxyService: AuthProxyService,
        @Inject('IDENTITY_SERVICE') private readonly authClient: ClientProxy,
    ) {}

    // @Public()
    // @Post('auth/register')
    // @HttpCode(HttpStatus.CREATED)
    // @ApiOperation({ summary: 'Register a new user' })
    // async register(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    //    const data = await this.authProxyService.forward(req, '/api/auth/register', 'POST');
    //    this.forwardCookie(res, data);
    //    return data;
    // }

    // @Public()
    // @Post('auth/login')
    // @HttpCode(HttpStatus.OK)
    // @ApiOperation({ summary: 'Login user with email and password' })
    // async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    //     const data = await this.authProxyService.forward(req, '/api/auth/login', 'POST');
    //     this.forwardCookie(res, data);
    //     return data;   
    // }

    @Public()
    @Post('auth/refresh')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Refresh access token' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const data = await this.authProxyService.forward(req, '/api/auth/refresh', 'POST');
        this.forwardCookie(res, data);
        return data;
    }

    @Public()
    @Get('auth/google')
    @ApiOperation({ summary: 'Initiate Google OAuth' })
    googleAuth(@Res() res: Response) {
        const authUrl = this.configService.get<string>('services.authUrl');
        return res.redirect(`${authUrl}/api/auth/google`);
    }

    @Post('auth/logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout current session' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const data = await this.authProxyService.forward(req, '/api/auth/logout', 'POST');
        res.clearCookie('refreshToken');
        return data;
    }

    @Post('auth/logout-all')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout from all devices' })
    async logoutAll(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const data = await this.authProxyService.forward(req, '/api/auth/logout-all', 'POST');
        res.clearCookie('refreshToken');
        return data;
    }


    //
    @Get('users/me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current authenticated user' })
    async getMe(@Req() req: Request) {
        return this.authProxyService.forward(req, '/api/users/me', 'GET');
    }
    
    @Get('users/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by ID' })
    async findOne(@Req() req: Request, @Param('id') _id: string) {
        return this.authProxyService.forward(req, `/api/users/${_id}`, 'GET');
    }
    
    @Patch('users/me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user profile' })
    async updateMe(@Req() req: Request) {
        return this.authProxyService.forward(req, '/api/users/me', 'PATCH');
    }


    // OT TUK POCHVAT NOVITE ROUTERS
    // TEST ROUTE
    @Public()
    @Get('auth/test')
    async test() {
      return this.send('auth.test', {});
    }

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

    // DO TUK
    private forwardCookie(res: Response, data: any): void {
        if (data?.refreshToken) {
            const isProd = this.configService.get<boolean>('app.isDevelopment') === false;
            res.cookie('refreshToken', data.refreshToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
        }
    }  // TO REMOVE LATER THIS FUNC

    private setRefreshCookie(res: Response, refreshToken: string): void {
      const isProd = this.configService.get<string>('app.nodeEnv') === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
}
