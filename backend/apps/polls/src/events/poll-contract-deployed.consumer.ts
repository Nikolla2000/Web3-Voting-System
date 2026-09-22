import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConsumerService, ROUTING_KEYS } from '@app/shared';
import { PrismaService } from '../../prisma/prisma.service';

interface PollContractDeployedEvent {
  pollId: string;
  contractAddress: string;
}

/**
 * Consumes poll.contract_deployed, published by the blockchain service once
 * it deploys a poll's on-chain Semaphore group contract, and writes the
 * address back onto the Poll row — polls owns that column, blockchain never
 * persists its own copy.
 */
@Injectable()
export class PollContractDeployedConsumer implements OnModuleInit {
  private readonly logger = new Logger(PollContractDeployedConsumer.name);

  constructor(
    private readonly consumer: RabbitMQConsumerService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.consumer.registerConsumer<PollContractDeployedEvent>({
      queue: 'polls.contract-deployed',
      routingKey: ROUTING_KEYS.POLL_CONTRACT_DEPLOYED,
      onMessage: (event) => this.handleContractDeployed(event),
    });
  }

  private async handleContractDeployed(event: PollContractDeployedEvent) {
    try {
      await this.prisma.poll.update({
        where: { id: event.pollId },
        data: { contractAddress: event.contractAddress },
      });
      this.logger.log(
        `Poll ${event.pollId} contractAddress set to ${event.contractAddress}`,
      );
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        // Poll row is gone (e.g. deleted after creation) — nothing to attach the address to.
        this.logger.warn(
          `Poll ${event.pollId} no longer exists, dropping contract_deployed event`,
        );
        return;
      }
      throw error;
    }
  }
}
