// PATH: auth-service/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<JwtSignOptions['expiresIn']>(
            'jwt.accessExpiresIn',
          ),
        },
      }),
    }),
    UsersModule,
    RabbitMQModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
