import { Module } from '@nestjs/common';
import { RabbitMQConnectionService } from '@app/shared';
import { RabbitMQPublisherService } from './rabbitmq.service';

@Module({
  providers: [RabbitMQConnectionService, RabbitMQPublisherService],
  exports: [RabbitMQPublisherService],
})
export class RabbitMQModule {}