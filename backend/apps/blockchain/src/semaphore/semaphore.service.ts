import { Injectable, NotImplementedException } from '@nestjs/common';

export interface MerkleProof {
  root: string;
  siblings: string[];
  pathIndices: number[];
}

/**
 * Owns Semaphore group membership (Merkle tree) and proof verification.
 * Implementation lands in step 2 (@semaphore-protocol/group, /identity, /proof).
 */
@Injectable()
export class SemaphoreService {
  joinGroup(
    pollId: string,
    identityCommitment: string,
  ): Promise<{ root: string; index: number }> {
    throw new NotImplementedException(
      `SemaphoreService.joinGroup(${pollId}, ${identityCommitment}) — pending step 2 (Semaphore integration)`,
    );
  }

  getMerkleProof(
    pollId: string,
    identityCommitment: string,
  ): Promise<MerkleProof> {
    throw new NotImplementedException(
      `SemaphoreService.getMerkleProof(${pollId}, ${identityCommitment}) — pending step 2 (Semaphore integration)`,
    );
  }

  verifyProof(params: {
    pollId: string;
    optionId: string;
    merkleTreeRoot: string;
    nullifierHash: string;
    signal: string;
    proof: string;
  }): Promise<boolean> {
    throw new NotImplementedException(
      `SemaphoreService.verifyProof(${JSON.stringify(params)}) — pending step 2 (Semaphore integration)`,
    );
  }
}
