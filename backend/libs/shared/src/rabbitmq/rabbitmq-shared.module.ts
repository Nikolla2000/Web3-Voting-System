import { Module } from "@nestjs/common";
import { RabbitMQConnectionService } from "./rabbitmq-connection.service";
import { RabbitMQPublisherService } from "./rabbitmq-publisher.service";
import { RabbitMQConsumerService } from "./rabbitmq-consumer.service";

@Module({
  providers: [RabbitMQConnectionService, RabbitMQPublisherService, RabbitMQConsumerService],
  exports: [RabbitMQConnectionService, RabbitMQPublisherService, RabbitMQConsumerService],
})
export class RabbitMQSharedModule {}
