import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import {
  RABBITMQ_EXCHANGE,
  ROUTING_KEYS,
  QUEUES} from '@app/shared';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConsumerService.name);

  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    if (this.isShuttingDown) return;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    const url =
      this.configService.get<string>('rabbitmq.url') || 'amqp://localhost';

    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Ограничава колко unacked съобщения може да получи консюмъра наведнъж
      await this.channel.prefetch(10);

      // Exchange-ът вече е assert-нат от identity-service, но е идемпотентно
      // и безопасно да го направим и тук — services не трябва да разчитат
      // на реда на стартиране един спрямо друг.
      await this.channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', {
        durable: true,
      });

      const { queue } = await this.channel.assertQueue(
        QUEUES.NOTIFICATION_USER_REGISTERED,
        { durable: true },
      );

      await this.channel.bindQueue(
        queue,
        RABBITMQ_EXCHANGE,
        ROUTING_KEYS.USER_REGISTERED,
      );

      await this.channel.consume(queue, (msg) => this.handleMessage(msg), {
        noAck: false,
      });

      this.logger.log(
        `Connected to RabbitMQ - consuming '${ROUTING_KEYS.USER_REGISTERED}' from '${queue}'`,
      );

      this.connection.on('close', () => {
        this.connection = null;
        this.channel = null;

        if (!this.isShuttingDown) {
          this.logger.warn(
            'RabbitMQ connection closed - reconnecting in 5s...',
          );
          this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
        }
      });

      this.connection.on('error', (err) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
      });
    } catch (err: any) {
      this.logger.error(
        `Failed to connect to RabbitMQ - retrying in 5s... Error: ${err.message}`,
      );
      if (!this.isShuttingDown) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
      }
    }
  }

  private async handleMessage(msg: amqp.ConsumeMessage | null): Promise<void> {
    if (!msg || !this.channel) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      await this.notificationsService.handleUserRegistered(payload);
      this.channel.ack(msg);
    } catch (err: any) {
      this.logger.error(`Failed to process message: ${err.message}`);
      // requeue: false — иначе invalid payload влиза в infinite retry loop.
      // За production тук слагаш dead-letter exchange вместо direct drop.
      this.channel.nack(msg, false, false);
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {}
  }
}