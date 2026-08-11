import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
    JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('jwt.accessSecret'),
            signOptions: {
            expiresIn: configService.get<any>('jwt.accessExpiresIn'),
            },
        }),
    }),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})

export class UsersModule {};

