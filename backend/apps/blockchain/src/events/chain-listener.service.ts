import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  RabbitMQPublisherService,
  ROUTING_KEYS,
  fieldElementToUuid,
} from '@app/shared';
import {
  ContractService,
  VoteCastOnChainEvent,
} from '../contract/contract.service';

/**
 * The blockchain-indexer the roadmap describes as "not-yet-built" —
 * implemented here rather than as a separate app, since it's the same
 * on-chain concern as the rest of this service. Watches for confirmed
 * VoteCast logs across every poll contract and republishes them as
 * vote.cast, which polls/src/events/vote-sync.consumer.ts has been waiting
 * on since it was written.
 */
@Injectable()
export class ChainListenerService implements OnModuleInit {
  private readonly logger = new Logger(ChainListenerService.name);

  constructor(
    private readonly contractService: ContractService,
    private readonly publisher: RabbitMQPublisherService,
  ) {}

  onModuleInit() {
    this.contractService.watchVoteCastEvents((event) =>
      this.handleVoteCast(event),
    );
  }

  private handleVoteCast(event: VoteCastOnChainEvent) {
    const payload = {
      pollId: fieldElementToUuid(event.pollId),
      optionId: fieldElementToUuid(event.message),
      nullifierHash: event.nullifier.toString(),
    };

    this.logger.log(
      `VoteCast on-chain → poll ${payload.pollId}, option ${payload.optionId}`,
    );
    this.publisher.publish(ROUTING_KEYS.VOTE_CAST, payload);
  }
}
