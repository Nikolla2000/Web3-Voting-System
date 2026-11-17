import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { authHeaderOf, respond } from '@/test/axios-adapter';

const envelope = <T,>(data: T) => ({ data, statusCode: 200, success: true, timestamp: '' });

const rawPoll = {
  id: 'poll-1',
  title: 'Best city?',
  description: 'Pick one.',
  imageUrl: 'https://cdn/x.png',
  category: 'TECH_SCIENCE',
  startsAt: '2026-06-01T00:00:00.000Z',
  endsAt: '2026-06-05T00:00:00.000Z',
  contractAddress: null,
  creatorId: 'u1',
  totalVotes: 3,
  options: [{ id: 'o1', label: 'Lisbon', votes: 3 }],
};

async function setup(handler: (config: InternalAxiosRequestConfig) => unknown) {
  vi.resetModules();
  const { apiClient } = await import('@/lib/api/client');
  const { useAuthStore } = await import('@/lib/store/auth-store');
  useAuthStore.setState({ accessToken: 'access-1' });
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => handler(config));
  apiClient.defaults.adapter = adapter as never;
  return { adapter, polls: await import('@/lib/api/polls'), users: await import('@/lib/api/users') };
}

beforeEach(() => {
  vi.resetModules();
});

describe('polls API mapping', () => {
  it('normalises the gateway’s poll: lower-case category, no null contract address', async () => {
    const { polls } = await setup((config) => respond(config, 200, envelope(rawPoll)));

    const poll = await polls.fetchPollById('poll-1');

    expect(poll).toEqual({
      id: 'poll-1',
      title: 'Best city?',
      description: 'Pick one.',
      imageUrl: 'https://cdn/x.png',
      category: 'tech_science',
      startsAt: '2026-06-01T00:00:00.000Z',
      endsAt: '2026-06-05T00:00:00.000Z',
      contractAddress: '',
      options: [{ id: 'o1', label: 'Lisbon', votes: 3 }],
    });
    expect(poll).not.toHaveProperty('creatorId');
  });

  it('treats a poll with no options field (proto3 drops empty repeated fields) as having none', async () => {
    const withoutOptions: Partial<typeof rawPoll> = { ...rawPoll };
    delete withoutOptions.options;
    const { polls } = await setup((config) => respond(config, 200, envelope(withoutOptions)));

    expect((await polls.fetchPollById('poll-1')).options).toEqual([]);
  });

  it('passes list filters as query params and maps every item', async () => {
    const { polls, adapter } = await setup((config) =>
      respond(config, 200, envelope({ items: [rawPoll, { ...rawPoll, id: 'poll-2' }], total: 7, page: 1, limit: 2 })),
    );

    const result = await polls.fetchPolls({ status: 'active', limit: 2 });

    expect(adapter.mock.calls[0]![0].params).toEqual({ status: 'active', limit: 2 });
    expect(result.total).toBe(7);
    expect(result.items.map((p) => [p.id, p.category])).toEqual([
      ['poll-1', 'tech_science'],
      ['poll-2', 'tech_science'],
    ]);
  });

  it('uploads the cover image as multipart form data, not serialised', async () => {
    const { polls, adapter } = await setup((config) => respond(config, 200, envelope({ url: 'https://cdn/new.png' })));
    const file = new File(['png'], 'cover.png', { type: 'image/png' });

    await expect(polls.uploadPollImage(file)).resolves.toEqual({ url: 'https://cdn/new.png' });

    const config = adapter.mock.calls[0]![0];
    expect(config.url).toBe('/polls/images');
    // The body must stay the FormData itself; serialised (e.g. as JSON, the client's default
    // content type) the file would never arrive. The Content-Type header can't be checked here:
    // axios's real browser adapter drops it for FormData so the browser adds the boundary, and
    // this test swaps that adapter out.
    expect(config.data).toBeInstanceOf(FormData);
    expect((config.data as FormData).get('file')).toBe(file);
  });
});

describe('avatar upload to R2', () => {
  it('PUTs straight to the presigned URL without our access token or the API client', async () => {
    const { users, adapter } = await setup((config) => respond(config, 200));
    const put = vi.spyOn(axios, 'put').mockResolvedValue({ status: 200 });
    const file = new File(['png'], 'me.png', { type: 'image/png' });

    await users.uploadAvatarFile('https://r2.example/presigned?sig=1', file);

    expect(put).toHaveBeenCalledWith('https://r2.example/presigned?sig=1', file, {
      headers: { 'Content-Type': 'image/png' },
    });
    expect(adapter).not.toHaveBeenCalled(); // never through apiClient, so no Bearer header or refresh
  });

  it('confirms the uploaded key through the authenticated API', async () => {
    const { users, adapter } = await setup((config) => respond(config, 200, envelope({ id: 'u1', avatar: 'x' })));

    await users.confirmAvatar('avatars/u1/abc.png');

    const config = adapter.mock.calls[0]![0];
    expect([config.method, config.url, JSON.parse(config.data)]).toEqual([
      'patch',
      '/users/me/avatar',
      { key: 'avatars/u1/abc.png' },
    ]);
    expect(authHeaderOf(config)).toBe('Bearer access-1');
  });
});
