import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface PollsServiceGrpc {
  getPollById(data: { id: string }): Observable<{ contractAddress: string }>;
}

/**
 * Reads poll data owned by the polls service (specifically: the on-chain
 * contractAddress deployPollContract wrote back). Polls' own Postgres stays
 * the single source of truth for that field — this service never persists
 * its own copy.
 */
@Injectable()
export class PollsClientService implements OnModuleInit {
  private pollsService!: PollsServiceGrpc;

  constructor(@Inject('POLLS_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.pollsService =
      this.client.getService<PollsServiceGrpc>('PollsService');
  }

  async getPollContractAddress(pollId: string): Promise<string> {
    const poll = await firstValueFrom(
      this.pollsService.getPollById({ id: pollId }),
    );
    if (!poll.contractAddress) {
      throw new Error(
        `Poll ${pollId} has no contractAddress yet — its on-chain group may still be provisioning`,
      );
    }
    return poll.contractAddress;
  }
}
