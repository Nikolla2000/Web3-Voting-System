import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { ConfigModule } from '@nestjs/config';
import appConfig, { envValidationSchema } from './config/app.config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '../prisma/prisma.module'; 
import { AuthModule } from './auth/auth.module';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/identity/.env',
      isGlobal: true,
      load: [appConfig, jwtConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      }
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class IdentityModule {}
