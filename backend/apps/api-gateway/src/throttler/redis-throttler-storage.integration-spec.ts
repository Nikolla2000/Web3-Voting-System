import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { RedisService } from '@app/shared';
import Redis from 'ioredis';
import { RedisThrottlerStorage } from './redis-throttler-storage';

/**
 * Integration coverage for the actual rate-limiting behavior, which lives
 * entirely inside RedisThrottlerStorage's Lua script — fixed-window
 * increment, block-on-exceed, and "stay blocked without incrementing
 * further" — none of which a mocked `throttlerIncrement` (see
 * redis-throttler-storage.spec.ts) can verify, since that would just be
 * asserting the mock's own canned return value.
 *
 * Requires Docker. Run via `npm run test:integration`; excluded from the
 * default `npm test` run (see the root jest config's
 * testPathIgnorePatterns) so Docker isn't a requirement for ordinary unit
 * test runs.
 */
describe('RedisThrottlerStorage (integration)', () => {
  let container: StartedTestContainer;
  let client: Redis;
  let storage: RedisThrottlerStorage;

  beforeAll(async () => {
    container = await new GenericContainer('redis:7-alpine')
      .withExposedPorts(6379)
      .start();

    client = new Redis({
      host: container.getHost(),
      port: container.getMappedPort(6379),
      maxRetriesPerRequest: 3,
    });

    const redisService = { getClient: () => client } as unknown as RedisService;
    storage = new RedisThrottlerStorage(redisService);
  }, 60000);

  afterAll(async () => {
    await client.quit();
    await container.stop();
  });

  beforeEach(async () => {
    await client.flushall();
  });

  it('counts up from 1 on the first hit, without blocking', async () => {
    const result = await storage.increment('voter-1', 60000, 5, 30000, 'vote');

    expect(result.totalHits).toBe(1);
    expect(result.isBlocked).toBe(false);
  });

  it('increments on each subsequent hit for the same key within the window', async () => {
    await storage.increment('voter-1', 60000, 5, 30000, 'vote');
    await storage.increment('voter-1', 60000, 5, 30000, 'vote');
    const third = await storage.increment('voter-1', 60000, 5, 30000, 'vote');

    expect(third.totalHits).toBe(3);
  });

  it('keeps hits/blocking independent across different keys and throttler names', async () => {
    await storage.increment('voter-1', 60000, 5, 30000, 'vote');
    await storage.increment('voter-1', 60000, 5, 30000, 'vote');

    const otherKey = await storage.increment(
      'voter-2',
      60000,
      5,
      30000,
      'vote',
    );
    const otherThrottler = await storage.increment(
      'voter-1',
      60000,
      5,
      30000,
      'login',
    );

    expect(otherKey.totalHits).toBe(1);
    expect(otherThrottler.totalHits).toBe(1);
  });

  it('blocks once hits exceed the limit, and freezes the hit count while blocked', async () => {
    const limit = 3;

    for (let i = 0; i < limit; i++) {
      const result = await storage.increment(
        'voter-1',
        60000,
        limit,
        30000,
        'vote',
      );
      expect(result.isBlocked).toBe(false);
    }

    // The (limit + 1)th hit is the one that trips the block.
    const tripping = await storage.increment(
      'voter-1',
      60000,
      limit,
      30000,
      'vote',
    );
    expect(tripping.totalHits).toBe(limit + 1);
    expect(tripping.isBlocked).toBe(true);

    // Further requests while blocked must read back the frozen hit count,
    // not keep incrementing it.
    const whileBlocked = await storage.increment(
      'voter-1',
      60000,
      limit,
      30000,
      'vote',
    );
    expect(whileBlocked.totalHits).toBe(limit + 1);
    expect(whileBlocked.isBlocked).toBe(true);
  });

  it('unblocks and resets the hit count once the window has fully expired', async () => {
    const limit = 2;
    const ttlMs = 300;
    const blockMs = 300;

    await storage.increment('voter-1', ttlMs, limit, blockMs, 'vote');
    await storage.increment('voter-1', ttlMs, limit, blockMs, 'vote');
    const tripping = await storage.increment(
      'voter-1',
      ttlMs,
      limit,
      blockMs,
      'vote',
    );
    expect(tripping.isBlocked).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, blockMs + 100));

    const afterExpiry = await storage.increment(
      'voter-1',
      ttlMs,
      limit,
      blockMs,
      'vote',
    );
    expect(afterExpiry.isBlocked).toBe(false);
    expect(afterExpiry.totalHits).toBe(1);
  });
});
