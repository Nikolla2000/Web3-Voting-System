import { describe, expect, it } from 'vitest';
import { uuidToFieldElement } from '@/lib/voting/field-element';

describe('uuidToFieldElement', () => {
  it('packs the UUID’s 128 bits into a bigint (must mirror the backend identifier.util.ts)', () => {
    expect(uuidToFieldElement('00000000-0000-4000-8000-000000000001')).toBe(BigInt('0x00000000000040008000000000000001'));
  });

  it('is case-insensitive, so upper/lower-case UUIDs map to the same scope', () => {
    const lower = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
    expect(uuidToFieldElement(lower.toUpperCase())).toBe(uuidToFieldElement(lower));
  });

  it.each(['', 'not-a-uuid', '11111111-2222-4333-8444-55555555555', '11111111-2222-4333-8444-55555555555z'])(
    'rejects %j rather than silently producing a wrong field element',
    (input) => {
      expect(() => uuidToFieldElement(input)).toThrow(/Not a UUID/);
    },
  );
});
