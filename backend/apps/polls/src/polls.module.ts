import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import appConfig, { envValidationSchema } from './config/app.config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import rabbitmqConfig from './config/rabbitmq.config';
import { RabbitMQSharedModule } from '@app/shared';
import { VoteSyncConsumer } from './events/vote-sync.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/polls/.env',
      isGlobal: true,
      load: [appConfig, rabbitmqConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true
      }
    }),
    PrismaModule,
    RabbitMQSharedModule,
  ],
  controllers: [PollsController],
  providers: [PollsService, VoteSyncConsumer],
})
export class PollsModule {}
