import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProxyController } from './auth-proxy.controller';
import { AuthProxyService } from './auth-proxy.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001
        }
      }
    ]),
  ],
  controllers: [AuthProxyController],
  providers: [AuthProxyService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}