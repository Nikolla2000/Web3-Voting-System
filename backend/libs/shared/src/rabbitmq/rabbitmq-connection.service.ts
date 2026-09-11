import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { RABBITMQ_EXCHANGE } from './rabbitmq.constants';

@Injectable()
export class RabbitMQConnectionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMQConnectionService.name);

  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  private onReconnectCallbacks: Array<() => Promise<void>> = [];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    await this.disconnect();
  }

  onReconnect(callback: () => Promise<void>): void {
    this.onReconnectCallbacks.push(callback);
  }

  getChannel(): amqp.Channel | null {
    return this.channel;
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

      this.channel.on('close', () => {
        this.channel = null;
        this.logger.warn('RabbitMQ channel closed');
        
        if (!this.isShuttingDown && this.connection) {
          this.logger.log('Triggering reconnect due to channel closure...');
          this.connect();
        }
      });

      this.channel.on('error', (err) => {
        this.logger.error(`RabbitMQ channel error: ${err.message}`);
      });

      await this.channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', {
        durable: true,
      });

      this.logger.log(`Connected to RabbitMQ - exchange: ${RABBITMQ_EXCHANGE}`);

      for (const callback of this.onReconnectCallbacks) {
        await callback();
      }

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
      this.logger.error(
        `Failed to connect to RabbitMQ - retrying in 5s... Error: ${err.message}`,
      );
      if (!this.isShuttingDown) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
      }
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {}
  }
}