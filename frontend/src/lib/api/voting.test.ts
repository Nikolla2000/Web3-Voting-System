import { describe, expect, it } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '@/lib/api/client';
import { getMerkleProof } from '@/lib/api/voting';
import { respond } from '@/test/axios-adapter';

describe('getMerkleProof', () => {
  // gRPC/protobuf omits empty `repeated` fields, so a one-member group's proof arrives with no
  // `siblings` key at all — generateVoteProof would then crash on `undefined.map`.
  it('normalises a missing siblings array (one-member group) to []', async () => {
    apiClient.defaults.adapter = (async (config: InternalAxiosRequestConfig) =>
      respond(config, 200, { data: { root: '7', index: 0 } })) as never;

    await expect(getMerkleProof('poll-1', '123')).resolves.toEqual({
      root: '7',
      index: 0,
      siblings: [],
    });
  });

  it('passes the identity commitment as a query param and keeps real siblings', async () => {
    let seenParams: unknown;
    apiClient.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
      seenParams = config.params;
      return respond(config, 200, { data: { root: '7', index: 1, siblings: ['5'] } });
    }) as never;

    await expect(getMerkleProof('poll-1', '123')).resolves.toEqual({
      root: '7',
      index: 1,
      siblings: ['5'],
    });
    expect(seenParams).toEqual({ identityCommitment: '123' });
  });
});
