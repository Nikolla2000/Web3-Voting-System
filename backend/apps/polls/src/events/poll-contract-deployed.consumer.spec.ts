import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQConsumerService, RedisService } from '@app/shared';
import { PollContractDeployedConsumer } from './poll-contract-deployed.consumer';
import { PrismaService } from '../../prisma/prisma.service';
import {
  pollDetailCacheKey,
  pollsListVersionKey,
} from '../cache/polls-cache.constants';

/**
 * Covers PollContractDeployedConsumer — writes the on-chain contract address
 * back onto the Poll row polls owns, and invalidates the same two caches
 * vote-sync does. Also covers the P2025 case (poll row deleted before the
 * blockchain service's deploy event arrives) being dropped rather than
 * crashing the consumer.
 */
describe('PollContractDeployedConsumer', () => {
  let prisma: { poll: { update: jest.Mock } };
  let redisClient: { del: jest.Mock; incr: jest.Mock };
  let onMessage: (event: {
    pollId: string;
    contractAddress: string;
  }) => Promise<void>;

  const event = { pollId: 'poll-1', contractAddress: '0xabc' };

  beforeEach(async () => {
    prisma = { poll: { update: jest.fn() } };
    redisClient = { del: jest.fn(), incr: jest.fn() };

    const registerConsumer = jest
      .fn()
      .mockImplementation((options: { onMessage: typeof onMessage }) => {
        onMessage = options.onMessage;
        return Promise.resolve();
      });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollContractDeployedConsumer,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: { getClient: () => redisClient } },
        { provide: RabbitMQConsumerService, useValue: { registerConsumer } },
      ],
    }).compile();

    const consumer = module.get(PollContractDeployedConsumer);
    await consumer.onModuleInit();
  });

  it('writes the contract address and invalidates both caches', async () => {
    prisma.poll.update.mockResolvedValue(undefined);

    await onMessage(event);

    expect(prisma.poll.update).toHaveBeenCalledWith({
      where: { id: event.pollId },
      data: { contractAddress: event.contractAddress },
    });
    expect(redisClient.del).toHaveBeenCalledWith(
      pollDetailCacheKey(event.pollId),
    );
    expect(redisClient.incr).toHaveBeenCalledWith(pollsListVersionKey());
  });

  it('drops the event when the poll row is already gone (P2025) instead of throwing', async () => {
    prisma.poll.update.mockRejectedValue({ code: 'P2025' });

    await expect(onMessage(event)).resolves.toBeUndefined();

    expect(redisClient.del).not.toHaveBeenCalled();
  });

  it('propagates any other failure', async () => {
    prisma.poll.update.mockRejectedValue(new Error('connection reset'));

    await expect(onMessage(event)).rejects.toThrow('connection reset');
  });
});
