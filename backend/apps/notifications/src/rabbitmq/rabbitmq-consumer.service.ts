import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import {
  RABBITMQ_EXCHANGE,
  ROUTING_KEYS,
  RabbitMQConnectionService,
} from '@app/shared';
import { QUEUES } from './rabbitmq.constants';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RabbitMQConsumerService {
  private readonly logger = new Logger(RabbitMQConsumerService.name);

  constructor(
    private readonly connectionService: RabbitMQConnectionService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.connectionService.onReconnect(() => this.setupQueue());
  }

  private async setupQueue(): Promise<void> {
    const channel = this.connectionService.getChannel();
    if (!channel) return;

    await channel.prefetch(10);

    const { queue } = await channel.assertQueue(
      QUEUES.NOTIFICATION_USER_REGISTERED,
      { durable: true },
    );

    await channel.bindQueue(
      queue,
      RABBITMQ_EXCHANGE,
      ROUTING_KEYS.USER_REGISTERED,
    );

    await channel.consume(queue, (msg) => this.handleMessage(msg), {
      noAck: false,
    });

    this.logger.log(
      `Consuming '${ROUTING_KEYS.USER_REGISTERED}' from '${queue}'`,
    );
  }

  private async handleMessage(msg: amqp.ConsumeMessage | null): Promise<void> {
    const channel = this.connectionService.getChannel();
    if (!msg || !channel) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      await this.notificationsService.handleUserRegistered(payload);
      channel.ack(msg);
    } catch (err: any) {
      this.logger.error(`Failed to process message: ${err.message}`);
      channel.nack(msg, false, false);
    }
  }
}