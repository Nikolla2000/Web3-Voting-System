import { Module } from '@nestjs/common';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/polls/.env',
      isGlobal: true,
      load: [],
      validationOptions: {
        allowUnknown: true,
        abortEarly: true
      }
    }),
    PrismaModule
  ],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule {}
