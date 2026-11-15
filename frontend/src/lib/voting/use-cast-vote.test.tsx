import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Identity } from '@semaphore-protocol/identity';
import type { SemaphoreProof } from '@semaphore-protocol/proof';
import { generateProof } from '@semaphore-protocol/proof';
import { getMerkleProof, joinGroup, submitVote, type MerkleProofResponse } from '@/lib/api/voting';
import { uuidToFieldElement } from '@/lib/voting/field-element';
import { useCastVote } from '@/lib/voting/use-cast-vote';
import { deferred } from '@/test/axios-adapter';

// Network layer: never hit the gateway.
vi.mock('@/lib/api/voting', () => ({
  joinGroup: vi.fn(),
  getMerkleProof: vi.fn(),
  submitVote: vi.fn(),
}));

// Only the Groth16 prover itself is mocked: it downloads ~MBs of wasm/zkey from a CDN and takes
// seconds. Everything around it — the real Semaphore Identity, localStorage persistence, and
// generateVoteProof's Merkle-proof / field-element mapping — runs for real, because that wiring
// is exactly what has to match the backend for verification to succeed.
vi.mock('@semaphore-protocol/proof', () => ({ generateProof: vi.fn() }));

const POLL_ID = '11111111-2222-4333-8444-555555555555';
const OPTION_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const IDENTITY_KEY = `semaphore-identity:${POLL_ID}`;
const VOTED_KEY = `voted-tx:${POLL_ID}`;

const merkleProof: MerkleProofResponse = { root: '999', index: 3, siblings: ['11', '22'] };
const fakeProof = {
  merkleTreeDepth: 2,
  merkleTreeRoot: '999',
  nullifier: '424242',
  message: uuidToFieldElement(OPTION_ID).toString(),
  scope: uuidToFieldElement(POLL_ID).toString(),
  points: ['1', '2', '3', '4', '5', '6', '7', '8'],
} as unknown as SemaphoreProof;

function renderCastVote(pollId = POLL_ID) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useCastVote(pollId), { wrapper });
  return { ...hook, invalidateSpy };
}

function storedCommitment(key = IDENTITY_KEY): string {
  const stored = window.localStorage.getItem(key);
  expect(stored, `expected an identity persisted under ${key}`).not.toBeNull();
  return Identity.import(stored!).commitment.toString();
}

beforeEach(() => {
  vi.mocked(joinGroup).mockResolvedValue({ root: '999', index: 3 });
  vi.mocked(getMerkleProof).mockResolvedValue(merkleProof);
  vi.mocked(generateProof).mockResolvedValue(fakeProof);
  vi.mocked(submitVote).mockResolvedValue({ transactionHash: '0xabc' });
});

describe('useCastVote — happy path', () => {
  it('joins, fetches the Merkle proof, proves and submits, in that order, with one consistent identity', async () => {
    const { result, invalidateSpy } = renderCastVote();

    act(() => result.current.castVote(OPTION_ID));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const commitment = storedCommitment();
    expect(joinGroup).toHaveBeenCalledWith(POLL_ID, commitment);
    expect(getMerkleProof).toHaveBeenCalledWith(POLL_ID, commitment);

    const order = [joinGroup, getMerkleProof, generateProof, submitVote].map(
      (fn) => vi.mocked(fn).mock.invocationCallOrder[0],
    );
    expect(order).toEqual([...order].sort((a, b) => a! - b!));

    expect(result.current.transactionHash).toBe('0xabc');
    expect(window.localStorage.getItem(VOTED_KEY)).toBe('0xabc');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['poll', POLL_ID] });
    expect(result.current.step).toBeNull();
    expect(result.current.stepLabel).toBeNull();
  });

  it('hands the prover the backend Merkle proof as bigints and the poll/option UUIDs as field elements', async () => {
    const { result } = renderCastVote();

    act(() => result.current.castVote(OPTION_ID));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [identity, proofInput, message, scope] = vi.mocked(generateProof).mock.calls[0]!;
    expect((identity as Identity).commitment.toString()).toBe(storedCommitment());
    expect(proofInput).toEqual({
      root: BigInt('999'),
      leaf: (identity as Identity).commitment,
      index: 3,
      siblings: [BigInt('11'), BigInt('22')],
    });
    // Must match backend/libs/shared/src/blockchain/identifier.util.ts or on-chain verification fails.
    expect(message).toBe(BigInt('0xaaaaaaaabbbb4ccc8dddeeeeeeeeeeee'));
    expect(scope).toBe(BigInt('0x11111111222243338444555555555555'));
  });

  it('submits exactly the proof fields the gateway expects', async () => {
    const { result } = renderCastVote();

    act(() => result.current.castVote(OPTION_ID));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(submitVote).toHaveBeenCalledWith(POLL_ID, {
      merkleTreeDepth: 2,
      merkleTreeRoot: '999',
      nullifier: '424242',
      message: fakeProof.message,
      scope: fakeProof.scope,
      points: ['1', '2', '3', '4', '5', '6', '7', '8'],
    });
  });

  it('reports joining → proving → submitting progress while in flight', async () => {
    const join = deferred<{ root: string; index: number }>();
    const prove = deferred<SemaphoreProof>();
    const submit = deferred<{ transactionHash: string }>();
    vi.mocked(joinGroup).mockReturnValue(join.promise);
    vi.mocked(generateProof).mockReturnValue(prove.promise);
    vi.mocked(submitVote).mockReturnValue(submit.promise);
    const { result } = renderCastVote();

    act(() => result.current.castVote(OPTION_ID));
    await waitFor(() => expect(result.current.step).toBe('joining'));
    expect(result.current.isPending).toBe(true);
    expect(result.current.stepLabel).toBe('Registering your anonymous identity…');

    await act(async () => join.resolve({ root: '999', index: 3 }));
    await waitFor(() => expect(result.current.step).toBe('proving'));
    expect(result.current.stepLabel).toBe('Generating zero-knowledge proof…');

    await act(async () => prove.resolve(fakeProof));
    await waitFor(() => expect(result.current.step).toBe('submitting'));
    expect(result.current.stepLabel).toBe('Submitting your vote on-chain…');

    await act(async () => submit.resolve({ transactionHash: '0xabc' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.step).toBeNull();
  });
});

describe('useCastVote — identity persistence', () => {
  it('reuses an identity already stored for this poll instead of generating a new one', async () => {
    const existing = new Identity();
    window.localStorage.setItem(IDENTITY_KEY, existing.export());
    const { result } = renderCastVote();

    act(() => result.current.castVote(OPTION_ID));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(joinGroup).toHaveBeenCalledWith(POLL_ID, existing.commitment.toString());
  });

  it('keeps a separate identity per poll (votes in different polls stay unlinkable)', async () => {
    const otherPoll = '99999999-8888-4777-8666-555555555555';
    const first = renderCastVote(POLL_ID);
    act(() => first.result.current.castVote(OPTION_ID));
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));

    const second = renderCastVote(otherPoll);
    act(() => second.result.current.castVote(OPTION_ID));
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true));

    expect(storedCommitment(`semaphore-identity:${otherPoll}`)).not.toBe(storedCommitment(IDENTITY_KEY));
  });
});

describe('useCastVote — failure modes', () => {
  it.each([
    ['joining the group', joinGroup],
    ['fetching the Merkle proof', getMerkleProof],
    ['generating the proof', generateProof],
    ['submitting the vote', submitVote],
  ] as const)('a failure while %s surfaces the error, resets progress, and does not mark the poll voted', async (_, failingStep) => {
    const failure = new Error('step failed');
    vi.mocked(failingStep).mockRejectedValue(failure);
    const { result, invalidateSpy } = renderCastVote();

    act(() => result.current.castVote(OPTION_ID));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(failure);
    expect(result.current.step).toBeNull();
    expect(result.current.isPending).toBe(false);
    expect(window.localStorage.getItem(VOTED_KEY)).toBeNull();
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('stops at the failing step — nothing later in the chain runs', async () => {
    vi.mocked(getMerkleProof).mockRejectedValue(new Error('merkle failed'));
    const { result } = renderCastVote();

    act(() => result.current.castVote(OPTION_ID));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(generateProof).not.toHaveBeenCalled();
    expect(submitVote).not.toHaveBeenCalled();
  });

  // The critical one: once joinGroup has admitted a commitment, the backend rejects any *other*
  // commitment from this account for this poll (ALREADY_EXISTS). A retry after a later-step failure
  // must therefore resend the same identity, or the user is locked out of the poll for good.
  it('retries after a post-join failure with the same identity commitment', async () => {
    vi.mocked(generateProof).mockRejectedValueOnce(new Error('prover crashed'));
    const { result } = renderCastVote();

    act(() => result.current.castVote(OPTION_ID));
    await waitFor(() => expect(result.current.isError).toBe(true));

    act(() => result.current.castVote(OPTION_ID));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const calls = vi.mocked(joinGroup).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[1]![1]).toBe(calls[0]![1]);
    expect(window.localStorage.getItem(VOTED_KEY)).toBe('0xabc');
  });
});
