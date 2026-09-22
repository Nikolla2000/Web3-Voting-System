import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as grpcStatus } from '@grpc/grpc-js';
import { SemaphoreService } from './semaphore/semaphore.service';
import type { VerifyVoteProofInput } from './semaphore/semaphore.service';
import { ContractService } from './contract/contract.service';

@Controller()
export class BlockchainController {
  constructor(
    private readonly semaphoreService: SemaphoreService,
    private readonly contractService: ContractService,
  ) {}

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
  async verifyVoteProof(data: VerifyVoteProofInput) {
    const valid = await this.semaphoreService.verifyProof(data);
    return { valid };
  }

  @GrpcMethod('BlockchainService', 'SubmitVote')
  async submitVote(data: VerifyVoteProofInput) {
    const valid = await this.semaphoreService.verifyProof(data);
    if (!valid) {
      throw new RpcException({
        code: grpcStatus.INVALID_ARGUMENT,
        message: 'Invalid Semaphore proof',
      });
    }

    const { transactionHash } = await this.contractService.castVote(data);
    return { transactionHash };
  }
}
