import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
// import { PrismaService } from "prisma/prisma.service";
// import { Role } from "src/generated/prisma/enums";
// import { UsersService } from "src/users/users.service";
import { UsersService } from "../users/users.service";
import { AuthTokens, GoogleProfile, JwtPayload } from "./auth.types";
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from "@app/shared";
// import { User } from "src/generated/prisma/client";
// import { SafeUser } from "src/users/users.types";
import { SafeUser } from "../users/users.types";
import { PrismaService } from "apps/identity/prisma/prisma.service";
import { Role } from "../generated/prisma/enums";
import { RefreshToken, User } from "../generated/prisma/client";
import { AuthResponse } from "@app/shared";

@Injectable()
export class AuthService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

   /**
    * Generates both access and refresh tokens for a user
    */
    private async generateTokens(
        userId: string,
        email: string,
        username: string,
        role: Role,
    ) : Promise<AuthTokens> {
        const payload: JwtPayload = {
            sub: userId,
            email,
            username,
            role
        }

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('jwt.accessSecret'),
                expiresIn: this.configService.get<any>('jwt.accessExpiresIn')
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('jwt.refreshSecret'),
                expiresIn: this.configService.get<any>('jwt.refreshExpiresIn'),
            })
        ]);

        return { accessToken, refreshToken }
    }

    /**
     * Stores hashed refresh token in DB for validation on refresh
     */
    private async storeRefreshToken(
        userId: string,
        refreshToken: string,
    ) : Promise<void> {
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: {
                token: hashedToken,
                userId,
                expiresAt,
            }
        })
    }

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const user = await this.usersService.create(dto);
        const tokens = await this.generateTokens(
            user.id,
            user.email,
            user.username,
            user.role
        )

        await this.storeRefreshToken(user.id, tokens.refreshToken);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            tokens
        };
    }

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.usersService.findByEmail(dto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new ForbiddenException('Acocunt is deactivated');
        }

        if (!user.password) {
            throw new UnauthorizedException('This accound uses Google sign-in. Please login with Google.');
        }

        const passwordMatch = await bcrypt.compare(dto.password, user.password);

        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(
            user.id,
            user.email,
            user.username,
            user.role,
        )

        await this.storeRefreshToken(user.id, tokens.refreshToken);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            tokens
        }
    }

    async googleAuth(profile: GoogleProfile): Promise<AuthResponse> {
        let user: User | SafeUser | null = await this.usersService.findByEmail(profile.email);

        if (!user) {
            let username = profile.username;
            const existing = await this.usersService.findByUsername(profile.username);

            if (existing) {
                username = `${username}_${Date.now()}`;
            }

            user = await this.usersService.create({
                email: profile.email,
                username: username,
                avatar: profile.avatar
            });
        }

        const tokens = await this.generateTokens(
            user.id,
            user.email,
            user.username,
            user.role,
        );

        await this.storeRefreshToken(user.id, tokens.refreshToken);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            tokens
        }
    }

    async refresh(userId: string, incomingRefreshToken: string): Promise<AuthTokens> {
        const tokens = await this.prisma.refreshToken.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() }
            }
        })

        let matchedToken: RefreshToken | null = null;
        for (const stored of tokens) {
            const match = await bcrypt.compare(incomingRefreshToken, stored.token);
            if (match) {
                matchedToken = stored;
                break;
            }
        }

        if (!matchedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.prisma.refreshToken.delete({
            where: { id: matchedToken.id }
        });

        const user = await this.usersService.findById(userId);
        const newTokens = await this.generateTokens(
            user.id,
            user.email,
            user.username,
            user.role,
        );

        await this.storeRefreshToken(user.id, newTokens.refreshToken);

        return newTokens;
    }

    async logout(userId: string, refreshToken: string): Promise<void> {
        const tokens = await this.prisma.refreshToken.findMany({
            where: { userId }
        });

        for (const stored of tokens) {
            const match = await bcrypt.compare(refreshToken, stored.token);

            if (match) {
                await this.prisma.refreshToken.delete({ where: { id: stored.id } });
                return;
            }
        }
    }


    async logoutAll(userId: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: { userId }
        });
    }

}