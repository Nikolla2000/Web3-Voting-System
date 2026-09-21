import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConsumerService, ROUTING_KEYS } from '@app/shared';
import { ContractService } from '../contract/contract.service';

interface PollCreatedEvent {
  pollId: string;
}

/**
 * Consumes poll.created (published by polls on poll creation) and provisions
 * the on-chain Semaphore group + contract for that poll. Deployment lands
 * in step 3; this wiring is in place so the queue binding exists from day one.
 */
@Injectable()
export class PollCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(PollCreatedConsumer.name);

  constructor(
    private readonly consumer: RabbitMQConsumerService,
    private readonly contractService: ContractService,
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
    await this.contractService.deployPollContract(event.pollId);
  }
}
