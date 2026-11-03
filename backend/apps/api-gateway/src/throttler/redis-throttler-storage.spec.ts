import { RedisService } from '@app/shared';
import { RedisThrottlerStorage } from './redis-throttler-storage';

/**
 * Covers RedisThrottlerStorage.increment()'s own logic: the key naming
 * scheme and the translation from the Lua script's raw tuple response into
 * ThrottlerStorage's shape. The rate-limiting behavior itself (increment,
 * block-on-exceed, TTL semantics) lives inside the Lua script this class
 * hands to Redis — that's covered separately by
 * redis-throttler-storage.integration-spec.ts against a real Redis, since a
 * mock of `throttlerIncrement` can't verify what the script itself does.
 */
describe('RedisThrottlerStorage', () => {
  function makeClient(throttlerIncrement?: jest.Mock) {
    return {
      throttlerIncrement,
      defineCommand: jest.fn(),
    };
  }

  it('registers the custom Lua command on the connection when not already defined', () => {
    const client = makeClient(undefined);
    const redisService = { getClient: () => client } as unknown as RedisService;

    new RedisThrottlerStorage(redisService);

    expect(client.defineCommand).toHaveBeenCalledWith('throttlerIncrement', {
      numberOfKeys: 2,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- @types/jest types expect.any() as `any`
      lua: expect.any(String),
    });
  });

  it('does not redefine the command when another instance already registered it on the same connection', () => {
    const client = makeClient(jest.fn());
    const redisService = { getClient: () => client } as unknown as RedisService;

    new RedisThrottlerStorage(redisService);

    expect(client.defineCommand).not.toHaveBeenCalled();
  });

  describe('increment', () => {
    it('namespaces the hits/blocked keys by throttler name and forwards ttl/limit/blockDuration', async () => {
      const throttlerIncrement = jest.fn().mockResolvedValue([1, 60, 0, 0]);
      const client = makeClient(throttlerIncrement);
      const redisService = {
        getClient: () => client,
      } as unknown as RedisService;
      const storage = new RedisThrottlerStorage(redisService);

      await storage.increment('1.2.3.4', 60000, 5, 30000, 'auth');

      expect(throttlerIncrement).toHaveBeenCalledWith(
        'throttle:auth:1.2.3.4',
        'throttle:auth:1.2.3.4:blocked',
        60000,
        5,
        30000,
      );
    });

    it("translates isBlocked from the script's 0/1 flag into a real boolean", async () => {
      const throttlerIncrement = jest.fn().mockResolvedValue([6, 42, 1, 30]);
      const client = makeClient(throttlerIncrement);
      const redisService = {
        getClient: () => client,
      } as unknown as RedisService;
      const storage = new RedisThrottlerStorage(redisService);

      const result = await storage.increment('key', 60000, 5, 30000, 'default');

      expect(result).toEqual({
        totalHits: 6,
        timeToExpire: 42,
        isBlocked: true,
        timeToBlockExpire: 30,
      });
    });

    it('reports isBlocked: false when the script reports 0', async () => {
      const throttlerIncrement = jest.fn().mockResolvedValue([1, 60, 0, 0]);
      const client = makeClient(throttlerIncrement);
      const redisService = {
        getClient: () => client,
      } as unknown as RedisService;
      const storage = new RedisThrottlerStorage(redisService);

      const result = await storage.increment('key', 60000, 5, 30000, 'default');

      expect(result.isBlocked).toBe(false);
    });
  });
});
