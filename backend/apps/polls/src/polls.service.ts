import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from './generated/prisma';
// import { RabbitMQPublisherService } from './rabbitmq/rabbitmq.service';
import { RabbitMQPublisherService, ROUTING_KEYS, RedisService } from '@app/shared';
import { RpcException } from '@nestjs/microservices';
import { status as grpcStatus } from '@grpc/grpc-js';
import {
  POLL_DETAIL_CACHE_TTL_SECONDS,
  pollDetailCacheKey,
} from './cache/polls-cache.constants';

interface CreatePollInput {
  creatorId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  startsAt: string;
  endsAt: string;
  options: string[];
}

export interface FindManyInput {
  search?: string;
  status?: 'all' | 'active' | 'upcoming' | 'ended';
  sortBy?: 'newest' | 'endingSoon' | 'mostVotes' | 'alphabetical';
  page?: number;
  limit?: number;
}

@Injectable()
export class PollsService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly publisher: RabbitMQPublisherService,
    private readonly redis: RedisService,
  ) {}

  async create(input: CreatePollInput) {
    const poll = await this.prisma.poll.create({
      data: {
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        category: input.category.toUpperCase() as Prisma.PollCreateInput['category'],
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        creatorId: input.creatorId,
        options: { create: input.options.map((label) => ({ label })) },
      },
      include: { options: true }
    });

    await this.publisher.publish(ROUTING_KEYS.POLL_CREATED, {
      pollId: poll.id,
      title: poll.title,
      creatorId: poll.creatorId,
      startsAt: poll.startsAt,
    });

    return poll;
  }

  async findMany({ search, status = 'all', sortBy = 'newest', page = 1, limit = 12 }: FindManyInput) {
    const now = new Date();

    const statusWhere: Prisma.PollWhereInput =
      status === 'active'
        ? { startsAt: { lte: now }, endsAt: { gt: now } }
        : status === 'upcoming'
          ? { startsAt: { gt: now } }
          : status === 'ended'
            ? { endsAt: { lte: now } }
            : {};

    const where: Prisma.PollWhereInput = {
      ...statusWhere,
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    };

    const orderBy: Prisma.PollOrderByWithRelationInput =
      sortBy === 'endingSoon'
        ? { endsAt: 'asc' }
        : sortBy === 'mostVotes'
          ? { totalVotes: 'desc' }
          : sortBy === 'alphabetical'
            ? { title: 'asc' }
            : { startsAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.poll.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { options: true } }),
      this.prisma.poll.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    const cacheKey = pollDetailCacheKey(id);
    const cached = await this.redis.getClient().get(cacheKey);
    if (cached) {
      return deserializePoll(JSON.parse(cached));
    }

    const poll = await this.prisma.poll.findUnique({ where: { id }, include: { options: true } });

    if (!poll) {
      throw new RpcException({ code: grpcStatus.NOT_FOUND, message: `Poll ${id} not found` });
    }

    await this.redis
      .getClient()
      .set(cacheKey, JSON.stringify(poll), 'EX', POLL_DETAIL_CACHE_TTL_SECONDS);

    return poll;
  }
}

// Round-tripping through JSON turns Date fields into strings — restore them
// so a cache hit returns the same shape findById's live Prisma read does.
function deserializePoll<T extends { startsAt: string; endsAt: string; createdAt: string; updatedAt: string }>(
  poll: T,
): T & { startsAt: Date; endsAt: Date; createdAt: Date; updatedAt: Date } {
  return {
    ...poll,
    startsAt: new Date(poll.startsAt),
    endsAt: new Date(poll.endsAt),
    createdAt: new Date(poll.createdAt),
    updatedAt: new Date(poll.updatedAt),
  };
}
