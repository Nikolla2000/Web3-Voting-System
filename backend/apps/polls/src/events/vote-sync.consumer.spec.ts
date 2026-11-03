import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQConsumerService, RedisService } from '@app/shared';
import { VoteSyncConsumer } from './vote-sync.consumer';
import { PrismaService } from '../../prisma/prisma.service';
import {
  pollDetailCacheKey,
  pollsListVersionKey,
} from '../cache/polls-cache.constants';

/**
 * Covers VoteSyncConsumer.handleVoteCast — the idempotency gate against
 * at-least-once redelivery (ProcessedVote's unique constraint, surfaced as a
 * Prisma P2002) and the cache invalidation that keeps the 60s poll-detail
 * cache-aside and the versioned listing cache from serving stale vote
 * counts. Prisma/Redis/the RabbitMQ consumer wrapper are all mocked.
 */
describe('VoteSyncConsumer', () => {
  let prisma: {
    processedVote: { create: jest.Mock };
    pollOption: { update: jest.Mock };
    poll: { update: jest.Mock };
    $transaction: jest.Mock;
  };
  let redisClient: { del: jest.Mock; incr: jest.Mock };
  let onMessage: (event: {
    pollId: string;
    optionId: string;
    nullifierHash: string;
  }) => Promise<void>;

  const event = {
    pollId: 'poll-1',
    optionId: 'option-1',
    nullifierHash: 'nullifier-abc',
  };

  beforeEach(async () => {
    prisma = {
      processedVote: {
        create: jest.fn().mockReturnValue('create-processed-vote'),
      },
      pollOption: { update: jest.fn().mockReturnValue('increment-option') },
      poll: { update: jest.fn().mockReturnValue('increment-poll-total') },
      $transaction: jest.fn(),
    };
    redisClient = { del: jest.fn(), incr: jest.fn() };

    const registerConsumer = jest
      .fn()
      .mockImplementation((options: { onMessage: typeof onMessage }) => {
        onMessage = options.onMessage;
        return Promise.resolve();
      });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoteSyncConsumer,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: { getClient: () => redisClient } },
        { provide: RabbitMQConsumerService, useValue: { registerConsumer } },
      ],
    }).compile();

    const consumer = module.get(VoteSyncConsumer);
    await consumer.onModuleInit();
  });

  it('increments the option/poll vote counts transactionally and invalidates both caches', async () => {
    prisma.$transaction.mockResolvedValue([undefined, undefined, undefined]);

    await onMessage(event);

    expect(prisma.processedVote.create).toHaveBeenCalledWith({
      data: { pollId: event.pollId, nullifierHash: event.nullifierHash },
    });
    expect(prisma.pollOption.update).toHaveBeenCalledWith({
      where: { id: event.optionId },
      data: { votes: { increment: 1 } },
    });
    expect(prisma.poll.update).toHaveBeenCalledWith({
      where: { id: event.pollId },
      data: { totalVotes: { increment: 1 } },
    });
    expect(prisma.$transaction).toHaveBeenCalledWith([
      'create-processed-vote',
      'increment-option',
      'increment-poll-total',
    ]);

    expect(redisClient.del).toHaveBeenCalledWith(
      pollDetailCacheKey(event.pollId),
    );
    expect(redisClient.incr).toHaveBeenCalledWith(pollsListVersionKey());
  });

  it('silently swallows a redelivered vote (P2002 on the ProcessedVote unique constraint) without touching the cache', async () => {
    prisma.$transaction.mockRejectedValue({ code: 'P2002' });

    await expect(onMessage(event)).resolves.toBeUndefined();

    expect(redisClient.del).not.toHaveBeenCalled();
    expect(redisClient.incr).not.toHaveBeenCalled();
  });

  it('propagates any other transaction failure instead of swallowing it', async () => {
    prisma.$transaction.mockRejectedValue(new Error('connection reset'));

    await expect(onMessage(event)).rejects.toThrow('connection reset');

    expect(redisClient.del).not.toHaveBeenCalled();
  });
});
