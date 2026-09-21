import { Injectable, NotImplementedException } from '@nestjs/common';

/**
 * Owns the viem client and all reads/writes against the on-chain Semaphore
 * group + poll contracts. Implementation lands in step 3 (blockchain connection).
 */
@Injectable()
export class ContractService {
  deployPollContract(pollId: string): Promise<{ contractAddress: string }> {
    throw new NotImplementedException(
      `ContractService.deployPollContract(${pollId}) — pending step 3 (blockchain connection)`,
    );
  }
}
