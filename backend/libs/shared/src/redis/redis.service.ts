import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Thin wrapper around a single ioredis connection, shared by whichever
 * per-app module imports it. Exposes the raw client rather than
 * cache-specific helpers (JSON (de)serialization, TTL conventions, key
 * schemas) — those decisions belong to each consumer (cache-aside reads in
 * `polls`, throttler storage in `api-gateway`), not to this connection layer.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis(this.configService.getOrThrow<string>('redis.url'), {
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => this.logger.log('Connected to Redis'));
    this.client.on('error', (err) => this.logger.error(`Redis connection error: ${err.message}`));
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
