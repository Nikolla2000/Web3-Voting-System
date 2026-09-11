import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { RABBITMQ_EXCHANGE } from './rabbitmq.constants';

@Injectable()
export class RabbitMQConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConnectionService.name);
  
  private connectionWrapper: amqp.AmqpConnectionManager | null = null;
  private channelWrapper: amqp.ChannelWrapper | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>('rabbitmq.url') || 'amqp://localhost';

    this.connectionWrapper = amqp.connect([url]);

    this.connectionWrapper.on('connect', () => {
      this.logger.log('RabbitMQ connection established successfully.');
    });

    this.connectionWrapper.on('disconnect', (err) => {
      this.logger.error(`RabbitMQ disconnected: ${err.err.message}`);
    });

    this.channelWrapper = this.connectionWrapper.createChannel({
      setup: async (channel: Channel) => {
        await channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', { durable: true });
        this.logger.log(`Exchange '${RABBITMQ_EXCHANGE}' asserted successfully.`);
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.channelWrapper?.close();
    await this.connectionWrapper?.close();
  }

  getChannel(): amqp.ChannelWrapper | null {
    return this.channelWrapper;
  }
}
