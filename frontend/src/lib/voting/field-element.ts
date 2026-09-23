/**
 * Mirrors backend/libs/shared/src/blockchain/identifier.util.ts — deliberately
 * duplicated rather than shared, since frontend/backend are separate npm
 * projects with no shared package (see CLAUDE.md). Keep the two in sync.
 *
 * Semaphore's scope/message are field elements: generateProof() accepts a
 * plain string but falls back to ethers' encodeBytes32String, which rejects
 * anything over 31 UTF-8 bytes — a 36-character poll/option UUID doesn't
 * fit. Stripping the dashes turns it into 16 raw bytes (128 bits), so we
 * pass it as a bigint instead and skip that encoding path entirely.
 */
export function uuidToFieldElement(uuid: string): bigint {
  const hex = uuid.replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/i.test(hex)) {
    throw new Error(`Not a UUID, can't derive a Semaphore field element: ${uuid}`);
  }
  return BigInt(`0x${hex}`);
}
