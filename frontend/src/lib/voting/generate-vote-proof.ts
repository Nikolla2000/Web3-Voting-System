import type { Identity } from '@semaphore-protocol/identity';
import type { MerkleProof } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';
import { uuidToFieldElement } from './field-element';
import type { MerkleProofResponse } from '@/lib/api/voting';
import type { VoteProofPayload } from '@/lib/api/voting';

/**
 * Must match apps/blockchain/src/contract/contract.service.ts's
 * deployPollContract, which hardcodes this same value when provisioning a
 * poll's on-chain group (it picks which Groth16 verifying key/circuit gets
 * used). There's no shared package to enforce this — it's a protocol
 * constant the two sides just have to agree on.
 */
export const SEMAPHORE_MERKLE_TREE_DEPTH = 20;

/**
 * Runs the actual zero-knowledge proving in the browser — the expensive
 * step (real Groth16 proof generation, can take a few seconds). The
 * snark artifacts (wasm + zkey for this depth) are fetched automatically
 * from Semaphore's CDN on first use and cached by the browser.
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

  const proof = await generateProof(identity, proofInput, message, scope, SEMAPHORE_MERKLE_TREE_DEPTH);

  return {
    merkleTreeDepth: proof.merkleTreeDepth,
    merkleTreeRoot: proof.merkleTreeRoot,
    nullifier: proof.nullifier,
    message: proof.message,
    scope: proof.scope,
    points: proof.points as unknown as string[],
  };
}
