import { Injectable } from '@nestjs/common';
import { createPublicClient, createWalletClient, http, getAbiItem } from 'viem';
import type { Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { uuidToFieldElement } from '@app/shared';
import { pollVotingAbi } from './abi/poll-voting.abi';

export interface CastVoteInput {
  pollId: string;
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  nullifier: string;
  message: string;
  scope: string;
  points: string[];
}

export interface VoteCastOnChainEvent {
  pollId: bigint;
  message: bigint;
  nullifier: bigint;
}

/**
 * Owns the viem client and all reads/writes against the on-chain PollVoting
 * contract (see contracts/contracts/PollVoting.sol) — a single deployed
 * instance shared across every poll, wrapping the canonical Semaphore
 * contract with one Semaphore group per poll.
 *
 * Every on-chain tx is signed by the relayer account (RELAYER_PRIVATE_KEY),
 * never the voter's own wallet: anonymity depends on every vote sharing one
 * sender regardless of which identity generated the proof. That same
 * address must be the contract's owner on-chain (createPoll/addMember are
 * onlyOwner), so createPoll/addMember revert if the two don't match.
 */
@Injectable()
export class ContractService {
  private readonly publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.RPC_URL),
  });

  private readonly walletClient = createWalletClient({
    chain: sepolia,
    transport: http(process.env.RPC_URL),
    account: privateKeyToAccount(
      process.env.RELAYER_PRIVATE_KEY as `0x${string}`,
    ),
  });

  private readonly pollVotingAddress = process.env
    .POLL_VOTING_CONTRACT_ADDRESS as Address;

  async createPoll(pollId: string): Promise<{ contractAddress: string }> {
    const pollIdField = uuidToFieldElement(pollId);

    const { request } = await this.publicClient.simulateContract({
      address: this.pollVotingAddress,
      abi: pollVotingAbi,
      functionName: 'createPoll',
      args: [pollIdField],
      account: this.walletClient.account,
    });
    const hash = await this.walletClient.writeContract(request);
    await this.publicClient.waitForTransactionReceipt({ hash });

    return { contractAddress: this.pollVotingAddress };
  }

  async addMember(pollId: string, identityCommitment: string): Promise<void> {
    const { request } = await this.publicClient.simulateContract({
      address: this.pollVotingAddress,
      abi: pollVotingAbi,
      functionName: 'addMember',
      args: [uuidToFieldElement(pollId), BigInt(identityCommitment)],
      account: this.walletClient.account,
    });
    const hash = await this.walletClient.writeContract(request);
    await this.publicClient.waitForTransactionReceipt({ hash });
  }

  async castVote(input: CastVoteInput): Promise<{ transactionHash: string }> {
    if (input.points.length !== 8) {
      throw new Error(`Expected 8 proof points, got ${input.points.length}`);
    }

    const points = input.points.map((point) => BigInt(point)) as [
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
    ];

    const { request } = await this.publicClient.simulateContract({
      address: this.pollVotingAddress,
      abi: pollVotingAbi,
      functionName: 'castVote',
      args: [
        uuidToFieldElement(input.pollId),
        {
          merkleTreeDepth: BigInt(input.merkleTreeDepth),
          merkleTreeRoot: BigInt(input.merkleTreeRoot),
          nullifier: BigInt(input.nullifier),
          message: BigInt(input.message),
          scope: BigInt(input.scope),
          points,
        },
      ],
      account: this.walletClient.account,
    });

    const hash = await this.walletClient.writeContract(request);
    await this.publicClient.waitForTransactionReceipt({ hash });
    return { transactionHash: hash };
  }

  /**
   * Filtered to the one known PollVoting address (unlike the old per-poll-
   * contract placeholder design, there's only ever one address now).
   */
  watchVoteCastEvents(
    onEvent: (event: VoteCastOnChainEvent) => void,
  ): () => void {
    const voteCastEvent = getAbiItem({ abi: pollVotingAbi, name: 'VoteCast' });
    return this.publicClient.watchEvent({
      address: this.pollVotingAddress,
      event: voteCastEvent,
      onLogs: (logs) => {
        for (const log of logs) {
          const { pollId, message, nullifier } = log.args;
          if (
            pollId === undefined ||
            message === undefined ||
            nullifier === undefined
          ) {
            continue; // decoded without one of the indexed/data fields — malformed log, skip it
          }
          onEvent({ pollId, message, nullifier });
        }
      },
    });
  }
}
