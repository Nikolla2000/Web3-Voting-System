import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { RABBITMQ_EXCHANGE, RoutingKey } from '@app/shared';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    if (this.isShuttingDown) return;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    const url = this.configService.get<string>('rabbitmq.url') || 'amqp://localhost';

    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', {
        durable: true,
      });

      this.logger.log(`Connected to RabbitMQ - exchange: ${RABBITMQ_EXCHANGE}`);

      this.connection.on('close', () => {
        this.connection = null;
        this.channel = null;
        
        if (!this.isShuttingDown) {
          this.logger.warn('RabbitMQ connection closed - reconnecting in 5s...');
          this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
        }
      });

      this.connection.on('error', (err) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
      });
    } catch (err: any) {
      this.logger.error(`Failed to connect to RabbitMQ - retrying in 5s... Error: ${err.message}`);
      if (!this.isShuttingDown) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
      }
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
    }
  }

  publish<T>(routingKey: RoutingKey, payload: T): void {
    if (!this.channel) {
      this.logger.warn(`Cannot publish '${routingKey}' — channel not ready`);
      return;
    }

    const message = Buffer.from(JSON.stringify(payload));

    this.channel.publish(RABBITMQ_EXCHANGE, routingKey, message, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
    });

    this.logger.log(`Published → ${routingKey}`);
  }
}
