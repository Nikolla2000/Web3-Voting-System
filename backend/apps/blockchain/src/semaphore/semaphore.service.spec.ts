import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { status as grpcStatus } from '@grpc/grpc-js';
import { SemaphoreService } from './semaphore.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ContractService } from '../contract/contract.service';

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected promise to reject');
}

/**
 * Covers SemaphoreService.joinGroup — the actual Sybil-resistance gate
 * (one identity commitment per (pollId, userId)) and its interaction with
 * the on-chain admission call, which must never be replayed once it
 * succeeds. PrismaService and ContractService are mocked: this is unit
 * coverage of the gating logic itself, not an integration test against a
 * real database or chain.
 */
describe('SemaphoreService — Sybil resistance (joinGroup)', () => {
  let service: SemaphoreService;
  let prisma: {
    groupMember: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
    };
  };
  let contractService: { addMember: jest.Mock };

  const pollId = 'poll-1';
  const userId = 'user-1';
  const commitmentA = '111';
  const commitmentB = '222';

  beforeEach(async () => {
    prisma = {
      groupMember: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
      },
    };
    contractService = { addMember: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemaphoreService,
        { provide: PrismaService, useValue: prisma },
        { provide: ContractService, useValue: contractService },
      ],
    }).compile();

    service = module.get(SemaphoreService);
  });

  it('lets a brand-new user join, admitting them on-chain before recording it off-chain', async () => {
    prisma.groupMember.findUnique.mockResolvedValue(null);

    const result = await service.joinGroup(pollId, commitmentA, userId);

    expect(contractService.addMember).toHaveBeenCalledWith(pollId, commitmentA);
    expect(prisma.groupMember.create).toHaveBeenCalledWith({
      data: { pollId, identityCommitment: commitmentA, index: 0, userId },
    });
    expect(typeof result.root).toBe('string');
    expect(result.index).toBe(0);
  });

  it('is idempotent when the same user resubmits the same commitment', async () => {
    prisma.groupMember.findUnique.mockResolvedValue({
      pollId,
      userId,
      identityCommitment: commitmentA,
      index: 0,
    });
    prisma.groupMember.findMany.mockResolvedValue([
      { identityCommitment: commitmentA },
    ]);

    const result = await service.joinGroup(pollId, commitmentA, userId);

    // A retried request must not spend gas or write a duplicate row.
    expect(contractService.addMember).not.toHaveBeenCalled();
    expect(prisma.groupMember.create).not.toHaveBeenCalled();
    expect(result.index).toBe(0);
  });

  it('rejects a second, different commitment for a user who already joined — the actual Sybil gate', async () => {
    prisma.groupMember.findUnique.mockResolvedValue({
      pollId,
      userId,
      identityCommitment: commitmentA,
      index: 0,
    });

    const error = await catchError(
      service.joinGroup(pollId, commitmentB, userId),
    );

    expect(error).toBeInstanceOf(RpcException);
    expect((error as RpcException).error).toEqual({
      code: grpcStatus.ALREADY_EXISTS,
      message: `Already joined poll ${pollId} with a different identity commitment`,
    });

    // The gate has to fire before any on-chain call or DB write — a
    // rejected join must never cost gas or leave a partial record.
    expect(contractService.addMember).not.toHaveBeenCalled();
    expect(prisma.groupMember.create).not.toHaveBeenCalled();
  });

  it('rejects a commitment that is already registered in the group under a different user', async () => {
    prisma.groupMember.findUnique.mockResolvedValue(null);
    prisma.groupMember.findMany.mockResolvedValue([
      { identityCommitment: commitmentA },
    ]);

    const error = await catchError(
      service.joinGroup(pollId, commitmentA, userId),
    );

    expect(error).toBeInstanceOf(RpcException);
    expect((error as RpcException).error).toEqual({
      code: grpcStatus.ALREADY_EXISTS,
      message: `Identity commitment already registered for poll ${pollId}`,
    });
    expect(contractService.addMember).not.toHaveBeenCalled();
  });

  it('recovers from a concurrent-join DB race by re-reading the DB instead of replaying the on-chain call', async () => {
    prisma.groupMember.findUnique
      .mockResolvedValueOnce(null) // initial check: this user hasn't joined yet
      .mockResolvedValueOnce({
        pollId,
        userId,
        identityCommitment: commitmentA,
        index: 0,
      }); // recovery read after the race

    prisma.groupMember.findMany
      .mockResolvedValueOnce([]) // first loadGroup: empty tree
      .mockResolvedValueOnce([{ identityCommitment: commitmentA }]); // reloaded after cache invalidation

    prisma.groupMember.create.mockRejectedValue({ code: 'P2002' });

    const result = await service.joinGroup(pollId, commitmentA, userId);

    // The on-chain admission already succeeded once and can't be undone —
    // recovering from the DB conflict must not call it a second time.
    expect(contractService.addMember).toHaveBeenCalledTimes(1);
    expect(result.index).toBe(0);
  });

  it('propagates the DB error rather than retrying on-chain if the conflicting row is not visible on re-read', async () => {
    // Every read after the P2002 still comes back empty — an edge case
    // (e.g. read-your-own-write lag) where recovery can't explain the
    // conflict. The old, buggy implementation recursed into joinGroup here,
    // which would pass every guard again and call addMember a second time.
    prisma.groupMember.findUnique.mockResolvedValue(null);
    prisma.groupMember.findMany.mockResolvedValue([]);
    prisma.groupMember.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.joinGroup(pollId, commitmentA, userId),
    ).rejects.toMatchObject({
      code: 'P2002',
    });

    expect(contractService.addMember).toHaveBeenCalledTimes(1);
  });

  it('never writes off-chain membership if the on-chain admission call fails', async () => {
    prisma.groupMember.findUnique.mockResolvedValue(null);
    contractService.addMember.mockRejectedValue(new Error('on-chain revert'));

    await expect(
      service.joinGroup(pollId, commitmentA, userId),
    ).rejects.toThrow('on-chain revert');

    expect(prisma.groupMember.create).not.toHaveBeenCalled();
  });
});
