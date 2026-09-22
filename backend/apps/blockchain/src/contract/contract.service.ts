import { Injectable } from '@nestjs/common';
import {
  createPublicClient,
  createWalletClient,
  http,
  getAbiItem,
  decodeEventLog,
} from 'viem';
import type { Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { uuidToFieldElement } from '@app/shared';
import { votingFactoryAbi } from './abi/voting-factory.abi';
import { pollAbi } from './abi/poll.abi';
import { PollsClientService } from '../polls-client/polls-client.service';

export interface CastVoteInput {
  pollId: string;
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
 * Owns the viem client and all reads/writes against the on-chain Semaphore
 * group + poll contracts.
 *
 * ABI is a placeholder: contracts/ hasn't been written yet (see roadmap), so
 * voting-factory.abi.ts / poll.abi.ts describe the interface this service
 * expects rather than a deployed contract. Swap in the real compiled ABI and
 * VOTING_FACTORY_ADDRESS once it exists — this class shouldn't need to change.
 *
 * Every on-chain tx is signed by the relayer account (RELAYER_PRIVATE_KEY),
 * never the voter's own wallet: anonymity depends on every vote sharing one
 * sender regardless of which identity generated the proof.
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

  private readonly factoryAddress = process.env
    .VOTING_FACTORY_ADDRESS as Address;

  constructor(private readonly pollsClient: PollsClientService) {}

  async deployPollContract(
    pollId: string,
  ): Promise<{ contractAddress: string }> {
    const pollIdField = uuidToFieldElement(pollId);

    const { request } = await this.publicClient.simulateContract({
      address: this.factoryAddress,
      abi: votingFactoryAbi,
      functionName: 'createPoll',
      args: [pollIdField, 20n],
      account: this.walletClient.account,
    });
    const hash = await this.walletClient.writeContract(request);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

    const createdEvent = getAbiItem({
      abi: votingFactoryAbi,
      name: 'PollCreated',
    });
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({ abi: [createdEvent], ...log });
        return { contractAddress: decoded.args.pollContract };
      } catch {
        continue; // a log from an unrelated contract/topic on the same tx
      }
    }

    throw new Error(
      `createPoll tx ${hash} for poll ${pollId} didn't emit PollCreated`,
    );
  }

  async castVote(input: CastVoteInput): Promise<{ transactionHash: string }> {
    if (input.points.length !== 8) {
      throw new Error(`Expected 8 proof points, got ${input.points.length}`);
    }

    const pollContractAddress = (await this.pollsClient.getPollContractAddress(
      input.pollId,
    )) as Address;
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
      address: pollContractAddress,
      abi: pollAbi,
      functionName: 'castVote',
      args: [
        BigInt(input.merkleTreeRoot),
        BigInt(input.nullifier),
        BigInt(input.message),
        BigInt(input.scope),
        points,
      ],
      account: this.walletClient.account,
    });

    const hash = await this.walletClient.writeContract(request);
    await this.publicClient.waitForTransactionReceipt({ hash });
    return { transactionHash: hash };
  }

  /**
   * No `address` filter: every poll contract shares the same ABI/event
   * signature, so one subscription catches VoteCast across every poll
   * without this service needing to track which addresses exist.
   */
  watchVoteCastEvents(
    onEvent: (event: VoteCastOnChainEvent) => void,
  ): () => void {
    const voteCastEvent = getAbiItem({ abi: pollAbi, name: 'VoteCast' });
    return this.publicClient.watchEvent({
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
