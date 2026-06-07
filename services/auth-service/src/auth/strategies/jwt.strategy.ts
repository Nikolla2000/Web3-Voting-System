import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "../auth.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwt.accessSecret'),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findById(payload.sub);

        if (!user) throw new UnauthorizedException('User no longer exists');
        if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

        return {
            id: payload.sub,
            email: payload.email,
            username: payload.username,
            role: payload.role
        }
    }
}