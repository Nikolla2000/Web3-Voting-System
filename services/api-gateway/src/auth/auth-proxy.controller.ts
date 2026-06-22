import { Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthProxyService } from "./auth-proxy.service";
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "./decorators/public.decorator";
import { Request, Response } from 'express';

@ApiTags('Auth')
@Controller()
export class AuthProxyController {
    constructor(
        private readonly configService: ConfigService,
        private readonly authProxyService: AuthProxyService
    ) {}

    @Public()
    @Post('auth/register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
       const data = await this.authProxyService.forward(req, '/api/auth/register', 'POST');
       this.forwardCookie(res, data);
       return data;
    }

    @Public()
    @Post('auth/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user with email and password' })
    async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const data = await this.authProxyService.forward(req, '/api/auth/login', 'POST');
        this.forwardCookie(res, data);
        return data;   
    }

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
    }

}
