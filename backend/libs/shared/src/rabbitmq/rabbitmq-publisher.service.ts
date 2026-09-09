import { Injectable, Logger } from '@nestjs/common';
import { RABBITMQ_EXCHANGE, RoutingKey } from '@app/shared';
import { RabbitMQConnectionService } from '@app/shared';

@Injectable()
export class RabbitMQPublisherService {
  private readonly logger = new Logger(RabbitMQPublisherService.name);

  constructor(private readonly connectionService: RabbitMQConnectionService) {}

  publish<T>(routingKey: RoutingKey, payload: T): void {
    const channel = this.connectionService.getChannel();

    if (!channel) {
      this.logger.warn(`Cannot publish '${routingKey}' - channel not ready`);
      return;
    }

    const message = Buffer.from(JSON.stringify(payload));

    channel.publish(RABBITMQ_EXCHANGE, routingKey, message, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
    });

    this.logger.log(`Published → ${routingKey}`);
  }
}