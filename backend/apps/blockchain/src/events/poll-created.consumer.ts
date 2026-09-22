import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  RabbitMQConsumerService,
  RabbitMQPublisherService,
  ROUTING_KEYS,
} from '@app/shared';
import { ContractService } from '../contract/contract.service';

interface PollCreatedEvent {
  pollId: string;
}

/**
 * Consumes poll.created (published by polls on poll creation) and provisions
 * the on-chain Semaphore group + contract for that poll. The resulting
 * contractAddress is published as poll.contract_deployed rather than
 * written directly to polls' database — polls owns that row and doesn't
 * yet consume this event, so wiring a consumer for it there is the
 * remaining step to actually persist it.
 */
@Injectable()
export class PollCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(PollCreatedConsumer.name);

  constructor(
    private readonly consumer: RabbitMQConsumerService,
    private readonly contractService: ContractService,
    private readonly publisher: RabbitMQPublisherService,
  ) {}

  async onModuleInit() {
    await this.consumer.registerConsumer<PollCreatedEvent>({
      queue: 'blockchain.poll-created',
      routingKey: ROUTING_KEYS.POLL_CREATED,
      onMessage: (event) => this.handlePollCreated(event),
    });
  }

  private async handlePollCreated(event: PollCreatedEvent) {
    this.logger.log(
      `poll.created received for pollId=${event.pollId}, provisioning on-chain group + contract`,
    );
    const { contractAddress } = await this.contractService.deployPollContract(
      event.pollId,
    );
    this.publisher.publish(ROUTING_KEYS.POLL_CONTRACT_DEPLOYED, {
      pollId: event.pollId,
      contractAddress,
    });
  }
}
