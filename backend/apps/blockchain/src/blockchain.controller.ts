import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SemaphoreService } from './semaphore/semaphore.service';

@Controller()
export class BlockchainController {
  constructor(private readonly semaphoreService: SemaphoreService) {}

  @GrpcMethod('BlockchainService', 'JoinGroup')
  joinGroup(data: { pollId: string; identityCommitment: string }) {
    return this.semaphoreService.joinGroup(
      data.pollId,
      data.identityCommitment,
    );
  }

  @GrpcMethod('BlockchainService', 'GetMerkleProof')
  getMerkleProof(data: { pollId: string; identityCommitment: string }) {
    return this.semaphoreService.getMerkleProof(
      data.pollId,
      data.identityCommitment,
    );
  }

  @GrpcMethod('BlockchainService', 'VerifyVoteProof')
  async verifyVoteProof(data: {
    pollId: string;
    optionId: string;
    merkleTreeRoot: string;
    nullifierHash: string;
    signal: string;
    proof: string;
  }) {
    const valid = await this.semaphoreService.verifyProof(data);
    return { valid };
  }
}
