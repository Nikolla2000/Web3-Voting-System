import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import appConfig, { envValidationSchema } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/polls/.env',
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true
      }
    }),
    PrismaModule
  ],
  controllers: [],
  providers: [],
})
export class PollsModule {}
