import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as grpcStatus } from '@grpc/grpc-js';
import { Group } from '@semaphore-protocol/group';
import { verifyProof } from '@semaphore-protocol/proof';
import type { PackedGroth16Proof } from '@zk-kit/utils';
import { uuidToFieldElement } from '@app/shared';
import { PrismaService } from '../../prisma/prisma.service';

export interface MerkleProof {
  root: string;
  index: number;
  siblings: string[];
}

export interface VerifyVoteProofInput {
  pollId: string;
  optionId: string;
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  nullifier: string;
  message: string;
  scope: string;
  points: string[];
}

/**
 * Mirrors @semaphore-protocol/proof's SemaphoreProof type. Redeclared locally
 * because that package's compiled .d.ts uses extensionless relative imports
 * ("./types"), which nodenext module resolution (used throughout this repo)
 * rejects — importing the type itself fails even though the `verifyProof`
 * function import works fine.
 */
interface SemaphoreProof {
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  message: string;
  nullifier: string;
  scope: string;
  points: PackedGroth16Proof;
}

// Same upstream issue leaves `verifyProof`'s inferred type as `any` — pin it
// down explicitly so callers get real type-checking instead of `any` leaking through.
const verifySemaphoreProof = verifyProof as (
  proof: SemaphoreProof,
) => Promise<boolean>;

/**
 * Owns Semaphore group membership (Merkle tree) and proof verification.
 *
 * The tree itself (a Group, i.e. a LeanIMT) only lives in memory — it's
 * rebuilt from GroupMember rows on first access per pollId and cached after
 * that. Persistence is in GroupMember, not in the tree, so a restart never
 * loses membership or invalidates previously-issued Merkle proofs.
 */
@Injectable()
export class SemaphoreService {
  private readonly logger = new Logger(SemaphoreService.name);
  private readonly groups = new Map<string, Group>();

  constructor(private readonly prisma: PrismaService) {}

  async joinGroup(
    pollId: string,
    identityCommitment: string,
  ): Promise<{ root: string; index: number }> {
    const commitment = BigInt(identityCommitment);
    const group = await this.loadGroup(pollId);

    const existingIndex = group.indexOf(commitment);
    if (existingIndex !== -1) {
      return { root: group.root.toString(), index: existingIndex };
    }

    group.addMember(commitment);
    const index = group.indexOf(commitment);

    try {
      await this.prisma.groupMember.create({
        data: { pollId, identityCommitment: commitment.toString(), index },
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        // Lost a race to a concurrent join for this poll — drop the stale
        // in-memory tree and let the retry rebuild it from the DB.
        this.groups.delete(pollId);
        return this.joinGroup(pollId, identityCommitment);
      }
      throw error;
    }

    return { root: group.root.toString(), index };
  }

  async getMerkleProof(
    pollId: string,
    identityCommitment: string,
  ): Promise<MerkleProof> {
    const commitment = BigInt(identityCommitment);
    const group = await this.loadGroup(pollId);

    const index = group.indexOf(commitment);
    if (index === -1) {
      // gRPC transport: RpcException + a @grpc/grpc-js status, matching
      // polls.service.ts's convention — @nestjs/common's HTTP exceptions
      // don't map to a sensible gRPC status from inside a @GrpcMethod.
      throw new RpcException({
        code: grpcStatus.NOT_FOUND,
        message: `${identityCommitment} has not joined poll ${pollId}'s group`,
      });
    }

    const proof = group.generateMerkleProof(index);
    return {
      root: proof.root.toString(),
      index: proof.index,
      siblings: proof.siblings.map((sibling) => sibling.toString()),
    };
  }

  async verifyProof(input: VerifyVoteProofInput): Promise<boolean> {
    const expectedScope = uuidToFieldElement(input.pollId).toString();
    const expectedMessage = uuidToFieldElement(input.optionId).toString();
    if (input.scope !== expectedScope || input.message !== expectedMessage) {
      this.logger.warn(
        `Proof scope/message doesn't match pollId/optionId for poll ${input.pollId}`,
      );
      return false;
    }

    if (input.points.length !== 8) {
      this.logger.warn(
        `Proof for poll ${input.pollId} has ${input.points.length} points, expected 8`,
      );
      return false;
    }

    const group = await this.loadGroup(input.pollId);
    if (input.merkleTreeRoot !== group.root.toString()) {
      // Either a stale root (member joined after this proof was built against
      // an older tree) or a proof crafted against a different group entirely.
      this.logger.warn(`Proof root mismatch for poll ${input.pollId}`);
      return false;
    }

    const proof: SemaphoreProof = {
      merkleTreeDepth: input.merkleTreeDepth,
      merkleTreeRoot: input.merkleTreeRoot,
      nullifier: input.nullifier,
      message: input.message,
      scope: input.scope,
      points: input.points as PackedGroth16Proof,
    };

    return verifySemaphoreProof(proof);
  }

  private async loadGroup(pollId: string): Promise<Group> {
    const cached = this.groups.get(pollId);
    if (cached) {
      return cached;
    }

    const members = await this.prisma.groupMember.findMany({
      where: { pollId },
      orderBy: { index: 'asc' },
      select: { identityCommitment: true },
    });

    const group = new Group(
      members.map((member) => BigInt(member.identityCommitment)),
    );
    this.groups.set(pollId, group);
    return group;
  }
}
