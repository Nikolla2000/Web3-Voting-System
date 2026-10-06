import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import appConfig, { envValidationSchema } from './config/app.config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import rabbitmqConfig from './config/rabbitmq.config';
import { RabbitMQSharedModule } from '@app/shared';
import redisConfig from '@app/shared/redis/redis.config';
import { VoteSyncConsumer } from './events/vote-sync.consumer';
import { PollContractDeployedConsumer } from './events/poll-contract-deployed.consumer';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/polls/.env',
      isGlobal: true,
      load: [appConfig, rabbitmqConfig, redisConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    PrismaModule,
    RabbitMQSharedModule,
    RedisModule,
  ],
  controllers: [PollsController],
  providers: [PollsService, VoteSyncConsumer, PollContractDeployedConsumer],
})
export class PollsModule {}
