import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import {
  RabbitMQPublisherService,
  ROUTING_KEYS,
  RedisService,
} from '@app/shared';
import { PollsService } from './polls.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  pollDetailCacheKey,
  pollsListVersionKey,
} from './cache/polls-cache.constants';

/**
 * Covers PollsService's own logic: the cache-aside read path (version-aware
 * listing key, 60s/30s TTLs) and the NOT_FOUND mapping on findById — the
 * behavior CLAUDE.md flags as regression-prone since a single poll-detail
 * page refetches every 15s. Prisma/Redis/RabbitMQ are all mocked.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access --
 * findMany/findById's cache-hit branch returns whatever JSON.parse gives
 * back, so their inferred return type is already `any` in the production
 * code — not something to fix via a test-only cast.
 */
describe('PollsService', () => {
  let service: PollsService;
  let prisma: {
    poll: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let redisClient: {
    get: jest.Mock;
    set: jest.Mock;
    incr: jest.Mock;
  };
  let publisher: { publish: jest.Mock };

  beforeEach(async () => {
    prisma = {
      poll: {
        create: jest.fn(),
        findMany: jest.fn().mockReturnValue('find-op'),
        count: jest.fn().mockReturnValue('count-op'),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    redisClient = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      incr: jest.fn().mockResolvedValue(1),
    };
    publisher = { publish: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: { getClient: () => redisClient } },
        { provide: RabbitMQPublisherService, useValue: publisher },
      ],
    }).compile();

    service = module.get(PollsService);
  });

  describe('create', () => {
    const input = {
      creatorId: 'user-1',
      title: 'Best language?',
      description: 'desc',
      imageUrl: 'https://img',
      category: 'tech',
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-01-08T00:00:00.000Z',
      options: ['TS', 'Go'],
    };

    it('uppercases the category and maps options, then bumps the listing version and publishes POLL_CREATED', async () => {
      const created = {
        id: 'poll-1',
        title: input.title,
        description: input.description,
        category: 'TECH',
        creatorId: input.creatorId,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
      };
      prisma.poll.create.mockResolvedValue(created);

      const result = await service.create(input);

      expect(prisma.poll.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          category: 'TECH',
          options: { create: [{ label: 'TS' }, { label: 'Go' }] },
        }),
        include: { options: true },
      });
      expect(redisClient.incr).toHaveBeenCalledWith(pollsListVersionKey());
      expect(publisher.publish).toHaveBeenCalledWith(
        ROUTING_KEYS.POLL_CREATED,
        expect.objectContaining({ pollId: 'poll-1', category: 'TECH' }),
      );
      expect(result).toBe(created);
    });
  });

  describe('findMany', () => {
    it('returns a cached listing without touching Prisma when the versioned key hits', async () => {
      const cachedPoll = {
        id: 'poll-1',
        startsAt: '2026-01-01T00:00:00.000Z',
        endsAt: '2026-01-08T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      redisClient.get.mockResolvedValueOnce('0'); // version lookup
      redisClient.get.mockResolvedValueOnce(
        JSON.stringify({ items: [cachedPoll], total: 1, page: 1, limit: 12 }),
      );

      const result = await service.findMany({});

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(result.items[0].startsAt).toBeInstanceOf(Date);
    });

    it('queries Prisma on a cache miss and caches the result under the current version', async () => {
      redisClient.get.mockResolvedValueOnce('3'); // version lookup
      redisClient.get.mockResolvedValueOnce(null); // listing cache miss
      prisma.$transaction.mockResolvedValue([[{ id: 'poll-1' }], 1]);

      const result = await service.findMany({
        status: 'active',
        page: 2,
        limit: 5,
      });

      expect(prisma.poll.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startsAt: { lte: expect.any(Date) },
            endsAt: { gt: expect.any(Date) },
          }),
          skip: 5, // (page 2 - 1) * limit 5
          take: 5,
        }),
      );
      expect(redisClient.set).toHaveBeenCalledWith(
        expect.stringContaining(':v3:'),
        expect.any(String),
        'EX',
        30,
      );
      expect(result).toEqual({
        items: [{ id: 'poll-1' }],
        total: 1,
        page: 2,
        limit: 5,
      });
    });

    it.each([
      ['upcoming', { startsAt: { gt: expect.any(Date) } }],
      ['ended', { endsAt: { lte: expect.any(Date) } }],
      ['all', {}],
    ] as const)(
      'maps status "%s" to the matching where clause',
      async (status, expectedWhere) => {
        redisClient.get.mockResolvedValueOnce('0').mockResolvedValueOnce(null);
        prisma.$transaction.mockResolvedValue([[], 0]);

        await service.findMany({ status });

        expect(prisma.poll.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: expectedWhere }),
        );
      },
    );

    it.each([
      ['endingSoon', { endsAt: 'asc' }],
      ['mostVotes', { totalVotes: 'desc' }],
      ['alphabetical', { title: 'asc' }],
      ['newest', { startsAt: 'desc' }],
    ] as const)(
      'maps sortBy "%s" to the matching orderBy',
      async (sortBy, expectedOrderBy) => {
        redisClient.get.mockResolvedValueOnce('0').mockResolvedValueOnce(null);
        prisma.$transaction.mockResolvedValue([[], 0]);

        await service.findMany({ sortBy });

        expect(prisma.poll.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: expectedOrderBy }),
        );
      },
    );

    it('adds a case-insensitive title filter when searching', async () => {
      redisClient.get.mockResolvedValueOnce('0').mockResolvedValueOnce(null);
      prisma.$transaction.mockResolvedValue([[], 0]);

      await service.findMany({ search: 'rust' });

      expect(prisma.poll.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { title: { contains: 'rust', mode: 'insensitive' } },
        }),
      );
    });
  });

  describe('findById', () => {
    it('returns the deserialized cached poll without querying Prisma', async () => {
      redisClient.get.mockResolvedValue(
        JSON.stringify({
          id: 'poll-1',
          startsAt: '2026-01-01T00:00:00.000Z',
          endsAt: '2026-01-08T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      );

      const result = await service.findById('poll-1');

      expect(prisma.poll.findUnique).not.toHaveBeenCalled();
      expect(result.startsAt).toBeInstanceOf(Date);
    });

    it('queries Prisma and populates the cache on a miss', async () => {
      redisClient.get.mockResolvedValue(null);
      const poll = { id: 'poll-1' };
      prisma.poll.findUnique.mockResolvedValue(poll);

      const result = await service.findById('poll-1');

      expect(result).toBe(poll);
      expect(redisClient.set).toHaveBeenCalledWith(
        pollDetailCacheKey('poll-1'),
        JSON.stringify(poll),
        'EX',
        60,
      );
    });

    it('throws a NOT_FOUND RpcException and does not cache anything when the poll does not exist', async () => {
      redisClient.get.mockResolvedValue(null);
      prisma.poll.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        RpcException,
      );
      expect(redisClient.set).not.toHaveBeenCalled();
    });
  });
});
