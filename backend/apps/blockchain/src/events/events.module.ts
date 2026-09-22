import { Module } from '@nestjs/common';
import { RabbitMQSharedModule } from '@app/shared';
import { PollCreatedConsumer } from './poll-created.consumer';
import { ChainListenerService } from './chain-listener.service';
import { ContractModule } from '../contract/contract.module';

@Module({
  imports: [RabbitMQSharedModule, ContractModule],
  providers: [PollCreatedConsumer, ChainListenerService],
})
export class EventsModule {}
