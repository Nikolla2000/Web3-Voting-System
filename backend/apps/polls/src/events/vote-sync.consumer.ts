// PATH: backend/apps/polls/src/events/vote-sync.consumer.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConsumerService } from '@app/shared';
import { POLLS_EVENTS } from '@app/shared/polls/polls.events';
import { PrismaService } from '../..//prisma/prisma.service';

interface VoteCastEvent {
  pollId: string;
  optionId: string;
  nullifierHash: string;
}

/**
 * Консумира vote.cast, публикуван от бъдещия blockchain-indexer service
 * след потвърден on-chain Semaphore proof. Инкрементира кешираните
 * брояч в Postgres. ProcessedVote прави обработката идемпотентна
 * срещу at-least-once redelivery от RabbitMQ.
 */
@Injectable()
export class VoteSyncConsumer implements OnModuleInit {
  private readonly logger = new Logger(VoteSyncConsumer.name);

  constructor(
    private readonly consumer: RabbitMQConsumerService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.consumer.consume('polls.vote-sync', POLLS_EVENTS.VOTE_CAST, (event: VoteCastEvent) => this.handleVoteCast(event), {
      onReconnect: () => this.logger.log('Vote-sync queue binding re-established'),
    });
  }

  private async handleVoteCast(event: VoteCastEvent) {
    try {
      await this.prisma.$transaction([
        this.prisma.processedVote.create({ data: { pollId: event.pollId, nullifierHash: event.nullifierHash } }),
        this.prisma.pollOption.update({ where: { id: event.optionId }, data: { votes: { increment: 1 } } }),
        this.prisma.poll.update({ where: { id: event.pollId }, data: { totalVotes: { increment: 1 } } }),
      ]);
    } catch (error: any) {
      if (error.code === 'P2002') {
        this.logger.warn(`Duplicate vote.cast игнориран (nullifier вече обработен): ${event.nullifierHash}`);
        return;
      }
      throw error;
    }
  }
}