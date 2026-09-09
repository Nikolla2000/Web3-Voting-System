import { Module } from "@nestjs/common";
import { RabbitMQConnectionService } from "./rabbitmq-connection.service";
import { RabbitMQPublisherService } from "./rabbitmq-publisher.service";

@Module({
  providers: [RabbitMQConnectionService, RabbitMQPublisherService],
  exports: [RabbitMQConnectionService, RabbitMQPublisherService],
})
export class RabbitMQSharedModule {}
