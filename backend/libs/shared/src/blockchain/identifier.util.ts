/**
 * Semaphore's `scope`/`message` are field elements: generateProof()/verifyProof()
 * accept a plain string but fall back to ethers' `encodeBytes32String`, which
 * rejects anything over 31 UTF-8 bytes — a standard 36-character poll/option
 * UUID doesn't fit. Stripping the dashes turns it into 16 raw bytes (128 bits),
 * comfortably inside the scalar field, so we pass it as a bigint instead of
 * a string and skip that encoding path entirely.
 *
 * The frontend must derive scope/message the exact same way when it calls
 * generateProof(), or verification here will fail on a legitimate vote.
 */
export function uuidToFieldElement(uuid: string): bigint {
  const hex = uuid.replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/i.test(hex)) {
    throw new Error(
      `Not a UUID, can't derive a Semaphore field element: ${uuid}`,
    );
  }
  return BigInt(`0x${hex}`);
}
