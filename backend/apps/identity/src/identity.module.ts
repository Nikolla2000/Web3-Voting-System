import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { ConfigModule } from '@nestjs/config';
import appConfig, { envValidationSchema } from './config/app.config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '../prisma/prisma.module'; 
import { AuthModule } from './auth/auth.module';
import jwtConfig from './config/jwt.config';
import rabbitmqConfig from './config/rabbitmq.config';
import { UsersModule } from './users/users.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/identity/.env',
      isGlobal: true,
      load: [appConfig, jwtConfig, rabbitmqConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      }
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RabbitMQModule,
  ],
  controllers: [],
  providers: [],
})
export class IdentityModule {}
