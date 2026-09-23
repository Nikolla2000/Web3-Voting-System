import type { Identity } from '@semaphore-protocol/identity';
import type { MerkleProof } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';
import { uuidToFieldElement } from './field-element';
import type { MerkleProofResponse } from '@/lib/api/voting';
import type { VoteProofPayload } from '@/lib/api/voting';

/**
 * Runs the actual zero-knowledge proving in the browser — the expensive
 * step (real Groth16 proof generation, can take a few seconds). The
 * snark artifacts (wasm + zkey) are fetched automatically from Semaphore's
 * CDN on first use and cached by the browser.
 *
 * No fixed tree depth is passed: Semaphore's on-chain groups (LeanIMT) have
 * a dynamic depth that grows with membership, and both the contract's
 * verifier and generateProof() infer which depth to use from the Merkle
 * proof itself (padding as needed) — nothing here needs to agree on a
 * constant with the backend.
 */
export async function generateVoteProof(
  identity: Identity,
  merkleProof: MerkleProofResponse,
  pollId: string,
  optionId: string,
): Promise<VoteProofPayload> {
  const proofInput: MerkleProof = {
    root: BigInt(merkleProof.root),
    leaf: identity.commitment,
    index: merkleProof.index,
    siblings: merkleProof.siblings.map((sibling) => BigInt(sibling)),
  };

  const message = uuidToFieldElement(optionId);
  const scope = uuidToFieldElement(pollId);

  const proof = await generateProof(identity, proofInput, message, scope);

  return {
    merkleTreeDepth: proof.merkleTreeDepth,
    merkleTreeRoot: proof.merkleTreeRoot,
    nullifier: proof.nullifier,
    message: proof.message,
    scope: proof.scope,
    points: proof.points as unknown as string[],
  };
}
