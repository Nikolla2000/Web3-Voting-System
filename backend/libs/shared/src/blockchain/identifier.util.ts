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

/**
 * Inverse of uuidToFieldElement. Needed because on-chain events only carry
 * field elements (uint256) — anything that has to turn a poll/option id back
 * into the UUID Postgres knows about (e.g. the chain listener republishing
 * vote.cast for polls' vote-sync consumer) has to undo the encoding.
 */
export function fieldElementToUuid(value: bigint): string {
  const hex = value.toString(16).padStart(32, '0');
  if (hex.length !== 32) {
    throw new Error(`Field element out of UUID range: ${value}`);
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
