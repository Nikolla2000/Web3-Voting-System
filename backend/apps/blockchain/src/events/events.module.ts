import { Module } from '@nestjs/common';
import { RabbitMQSharedModule } from '@app/shared';
import { PollCreatedConsumer } from './poll-created.consumer';
import { ContractModule } from '../contract/contract.module';

@Module({
  imports: [RabbitMQSharedModule, ContractModule],
  providers: [PollCreatedConsumer],
})
export class EventsModule {}
