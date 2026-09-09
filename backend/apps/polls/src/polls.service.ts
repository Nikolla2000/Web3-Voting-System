import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from './generated/prisma';
// import { RabbitMQPublisherService } from './rabbitmq/rabbitmq.service';
import { RabbitMQPublisherService } from '@app/shared';
import { POLLS_EVENTS } from '@app/shared';
import { RpcException } from '@nestjs/microservices';
import { status as grpcStatus } from '@grpc/grpc-js';

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

    await this.publisher.publish(POLLS_EVENTS.POLL_CREATED, {
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
    const poll = await this.prisma.poll.findUnique({ where: { id }, include: { options: true } });

    if (!poll) {
      throw new RpcException({ code: grpcStatus.NOT_FOUND, message: `Poll ${id} not found` });
    }

    return poll;
  }
}
