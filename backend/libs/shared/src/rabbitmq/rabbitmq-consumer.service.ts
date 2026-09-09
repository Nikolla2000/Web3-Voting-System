// PATH: backend/libs/shared/src/rabbitmq/rabbitmq-consumer.service.ts

import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RABBITMQ_EXCHANGE, RoutingKey } from './rabbitmq.constants';
import { RabbitMQConnectionService } from './rabbitmq-connection.service';

export interface ConsumeOptions<T> {
  /** Durable queue name, уникално за конкретния consumer (напр. 'notifications.welcome-email'). */
  queue: string;
  /** Routing key(s) на topic exchange-а, за които тази опашка се bind-ва. */
  routingKey: RoutingKey | RoutingKey[];
  /** Извиква се за всяко съобщение с парснатия JSON payload. Хвърли грешка → nack без requeue. */
  onMessage: (payload: T, raw: amqp.ConsumeMessage) => Promise<void>;
  /** Channel QoS. По подразбиране 10. */
  prefetch?: number;
}

/**
 * Generic RabbitMQ consumer, преизползваем от всеки микросървис. Всеки
 * извикващ регистрира собствена durable опашка, bind-ната към routing key(s)
 * на споделения topic exchange.
 *
 * Channel-level конструкции (queues, bindings) не преживяват reconnect, затова
 * setup-ът се преизпълнява и при първоначална връзка, и при всеки следващ
 * reconnect. registerConsumer() прави setup веднага (ако каналът вече е
 * готов) И регистрира onReconnect callback — работи коректно независимо
 * дали е извикан преди или след като RabbitMQConnectionService се е свързал.
 */
@Injectable()
export class RabbitMQConsumerService {
  private readonly logger = new Logger(RabbitMQConsumerService.name);

  constructor(private readonly connectionService: RabbitMQConnectionService) {}

  async registerConsumer<T>(options: ConsumeOptions<T>): Promise<void> {
    if (this.connectionService.getChannel()) {
      await this.setupQueue(options);
    }

    this.connectionService.onReconnect(() => this.setupQueue(options));
  }

  private async setupQueue<T>(options: ConsumeOptions<T>): Promise<void> {
    const channel = this.connectionService.getChannel();
    if (!channel) return;

    const { queue, routingKey, onMessage, prefetch = 10 } = options;
    const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

    await channel.prefetch(prefetch);
    const { queue: assertedQueue } = await channel.assertQueue(queue, { durable: true });

    for (const key of routingKeys) {
      await channel.bindQueue(assertedQueue, RABBITMQ_EXCHANGE, key);
    }

    await channel.consume(assertedQueue, (msg) => this.handleMessage(msg, onMessage), { noAck: false });

    this.logger.log(`Consuming [${routingKeys.join(', ')}] → queue '${assertedQueue}'`);
  }

  private async handleMessage<T>(
    msg: amqp.ConsumeMessage | null,
    onMessage: (payload: T, raw: amqp.ConsumeMessage) => Promise<void>,
  ): Promise<void> {
    const channel = this.connectionService.getChannel();
    if (!msg || !channel) return;

    try {
      const payload = JSON.parse(msg.content.toString()) as T;
      await onMessage(payload, msg);
      channel.ack(msg);
    } catch (err: any) {
      this.logger.error(`Failed to process message: ${err.message}`);
      channel.nack(msg, false, false);
    }
  }
}