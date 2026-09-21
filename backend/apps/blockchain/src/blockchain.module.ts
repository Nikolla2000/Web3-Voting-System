import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainController } from './blockchain.controller';
import appConfig, { envValidationSchema } from './config/app.config';
import rabbitmqConfig from './config/rabbitmq.config';
import { SemaphoreModule } from './semaphore/semaphore.module';
import { ContractModule } from './contract/contract.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/blockchain/.env',
      isGlobal: true,
      load: [appConfig, rabbitmqConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    SemaphoreModule,
    ContractModule,
    EventsModule,
  ],
  controllers: [BlockchainController],
  providers: [],
})
export class BlockchainModule {}
