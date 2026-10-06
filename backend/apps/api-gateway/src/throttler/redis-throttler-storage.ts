import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from '@app/shared';
import type { Redis, Result } from 'ioredis';

declare module 'ioredis' {
  interface RedisCommander<Context> {
    throttlerIncrement(
      hitsKey: string,
      blockedKey: string,
      ttlMs: number,
      limit: number,
      blockDurationMs: number,
    ): Result<[totalHits: number, timeToExpire: number, isBlocked: number, timeToBlockExpire: number], Context>;
  }
}

// Mirrors @nestjs/throttler's own in-memory ThrottlerStorageService (fixed
// window + block-on-exceed), just against Redis so counters survive a
// restart and are shared across instances. One EVAL keeps the
// read-blocked/increment/maybe-block sequence atomic under concurrent
// requests for the same key — a plain GET-then-INCR would race.
const INCREMENT_SCRIPT = `
local hitsKey = KEYS[1]
local blockedKey = KEYS[2]
local ttlMs = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local blockMs = tonumber(ARGV[3])

local blockedTtl = redis.call('PTTL', blockedKey)
if blockedTtl and blockedTtl > 0 then
  local hits = tonumber(redis.call('GET', hitsKey) or '0')
  local hitsTtl = redis.call('PTTL', hitsKey)
  if not hitsTtl or hitsTtl < 0 then hitsTtl = 0 end
  return { hits, math.ceil(hitsTtl / 1000), 1, math.ceil(blockedTtl / 1000) }
end

local hits = redis.call('INCR', hitsKey)
if hits == 1 then
  redis.call('PEXPIRE', hitsKey, ttlMs)
end
local hitsTtl = redis.call('PTTL', hitsKey)
if not hitsTtl or hitsTtl < 0 then hitsTtl = ttlMs end

local isBlocked = 0
local timeToBlockExpire = 0
if hits > limit then
  redis.call('SET', blockedKey, 1, 'PX', blockMs)
  isBlocked = 1
  timeToBlockExpire = math.ceil(blockMs / 1000)
end

return { hits, math.ceil(hitsTtl / 1000), isBlocked, timeToBlockExpire }
`;

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly client: Redis;

  constructor(redisService: RedisService) {
    this.client = redisService.getClient();

    if (typeof this.client.throttlerIncrement !== 'function') {
      this.client.defineCommand('throttlerIncrement', { numberOfKeys: 2, lua: INCREMENT_SCRIPT });
    }
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    const hitsKey = `throttle:${throttlerName}:${key}`;
    const blockedKey = `${hitsKey}:blocked`;

    const [totalHits, timeToExpire, isBlocked, timeToBlockExpire] = await this.client.throttlerIncrement(
      hitsKey,
      blockedKey,
      ttl,
      limit,
      blockDuration,
    );

    return {
      totalHits,
      timeToExpire,
      isBlocked: isBlocked === 1,
      timeToBlockExpire,
    };
  }
}
