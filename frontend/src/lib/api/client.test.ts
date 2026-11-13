import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';
import { authHeaderOf, deferred, flushPromises, respond } from '@/test/axios-adapter';

type Adapter = (config: InternalAxiosRequestConfig) => Promise<unknown>;

const REFRESH_OK = { data: { accessToken: 'new-token' } };

/**
 * client.ts keeps refresh state (`isRefreshing`, `pendingQueue`) at module level, and the store
 * is a module-level singleton — so each test imports both fresh rather than sharing them.
 */
async function setup(adapter: Adapter, accessToken: string | null = 'old-token') {
  vi.resetModules();
  const { apiClient } = await import('@/lib/api/client');
  const { useAuthStore } = await import('@/lib/store/auth-store');

  const handleSessionExpired = vi.fn();
  useAuthStore.setState({ accessToken, handleSessionExpired });

  const adapterSpy = vi.fn(adapter);
  apiClient.defaults.adapter = adapterSpy as never;

  const callsTo = (url: string) => adapterSpy.mock.calls.filter(([config]) => config.url === url);

  return { apiClient, useAuthStore, handleSessionExpired, adapterSpy, callsTo };
}

/** A protected resource: accepts only the refreshed token, 401s on anything else. */
function protectedResource(config: InternalAxiosRequestConfig) {
  return authHeaderOf(config) === 'Bearer new-token'
    ? respond(config, 200, { ok: config.url })
    : respond(config, 401, { message: 'Unauthorized' });
}

beforeEach(() => {
  vi.resetModules();
});

describe('apiClient request interceptor', () => {
  it('attaches the in-memory access token as a Bearer header', async () => {
    const { apiClient, adapterSpy } = await setup(async (config) => respond(config, 200), 'abc');

    await apiClient.get('/polls');

    expect(authHeaderOf(adapterSpy.mock.calls[0]![0])).toBe('Bearer abc');
  });

  it('sends no Authorization header when signed out', async () => {
    const { apiClient, adapterSpy } = await setup(async (config) => respond(config, 200), null);

    await apiClient.get('/polls');

    expect(authHeaderOf(adapterSpy.mock.calls[0]![0])).toBeUndefined();
  });

  it('reads the token at request time, not at client creation', async () => {
    const { apiClient, useAuthStore, adapterSpy } = await setup(async (config) => respond(config, 200), null);

    useAuthStore.setState({ accessToken: 'set-later' });
    await apiClient.get('/polls');

    expect(authHeaderOf(adapterSpy.mock.calls[0]![0])).toBe('Bearer set-later');
  });
});

describe('apiClient 401 refresh-and-retry', () => {
  it('refreshes once, stores the new token, and retries the original request with it', async () => {
    const { apiClient, useAuthStore, callsTo, handleSessionExpired } = await setup(async (config) =>
      config.url === '/auth/refresh' ? respond(config, 200, REFRESH_OK) : protectedResource(config),
    );

    const res = await apiClient.get('/users/me');

    expect(res.data).toEqual({ ok: '/users/me' });
    expect(useAuthStore.getState().accessToken).toBe('new-token');
    expect(callsTo('/auth/refresh')).toHaveLength(1);
    expect(callsTo('/users/me').map(([c]) => authHeaderOf(c))).toEqual(['Bearer old-token', 'Bearer new-token']);
    expect(handleSessionExpired).not.toHaveBeenCalled();
  });

  it('passes non-401 errors straight through without refreshing', async () => {
    const { apiClient, callsTo } = await setup(async (config) => respond(config, 500, { message: 'boom' }));

    await expect(apiClient.get('/polls')).rejects.toMatchObject({ response: { status: 500 } });
    expect(callsTo('/auth/refresh')).toHaveLength(0);
  });

  it.each(['/auth/login', '/auth/register', '/auth/refresh'])(
    'never tries to refresh when %s itself returns 401',
    async (url) => {
      const { apiClient, adapterSpy, handleSessionExpired } = await setup(async (config) =>
        respond(config, 401, { message: 'Invalid credentials' }),
      );

      await expect(apiClient.post(url)).rejects.toMatchObject({ response: { status: 401 } });
      expect(adapterSpy).toHaveBeenCalledTimes(1);
      expect(handleSessionExpired).not.toHaveBeenCalled();
    },
  );

  it('retries a request at most once: a 401 on the retry is surfaced, not refreshed again', async () => {
    const { apiClient, callsTo } = await setup(async (config) =>
      config.url === '/auth/refresh'
        ? respond(config, 200, REFRESH_OK)
        : respond(config, 401, { message: 'still unauthorized' }),
    );

    await expect(apiClient.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } });
    expect(callsTo('/auth/refresh')).toHaveLength(1);
    expect(callsTo('/users/me')).toHaveLength(2);
  });

  it('shares a single in-flight refresh between concurrent 401s and replays every queued request', async () => {
    const refresh = deferred<void>();
    const { apiClient, callsTo } = await setup(async (config) => {
      if (config.url === '/auth/refresh') {
        await refresh.promise;
        return respond(config, 200, REFRESH_OK);
      }
      return protectedResource(config);
    });

    const requests = Promise.all([apiClient.get('/a'), apiClient.get('/b'), apiClient.get('/c')]);
    await flushPromises(); // all three 401s handled; two of them now waiting in the queue
    expect(callsTo('/auth/refresh')).toHaveLength(1);

    refresh.resolve();
    const results = await requests;

    expect(results.map((r) => r.data)).toEqual([{ ok: '/a' }, { ok: '/b' }, { ok: '/c' }]);
    expect(callsTo('/auth/refresh')).toHaveLength(1);
    for (const url of ['/a', '/b', '/c']) {
      expect(callsTo(url).map(([c]) => authHeaderOf(c))).toEqual(['Bearer old-token', 'Bearer new-token']);
    }
  });

  it('when the refresh fails: rejects every queued request, expires the session once, and recovers for later', async () => {
    const refresh = deferred<void>();
    let refreshShouldFail = true;
    const { apiClient, callsTo, handleSessionExpired } = await setup(async (config) => {
      if (config.url === '/auth/refresh') {
        if (refreshShouldFail) {
          await refresh.promise;
          return respond(config, 401, { message: 'Refresh token expired' });
        }
        return respond(config, 200, REFRESH_OK);
      }
      return protectedResource(config);
    });

    const outcomes = Promise.allSettled([apiClient.get('/a'), apiClient.get('/b'), apiClient.get('/c')]);
    await flushPromises();
    refresh.resolve();
    const settled = await outcomes;

    expect(settled.map((s) => s.status)).toEqual(['rejected', 'rejected', 'rejected']);
    for (const s of settled) {
      expect((s as PromiseRejectedResult).reason).toMatchObject({ config: { url: '/auth/refresh' } });
    }
    expect(callsTo('/a')).toHaveLength(1); // queued requests are not replayed after a failed refresh
    expect(handleSessionExpired).toHaveBeenCalledTimes(1);

    // The lock must be released: a later 401 starts a fresh refresh instead of queuing forever.
    refreshShouldFail = false;
    await expect(apiClient.get('/d')).resolves.toMatchObject({ data: { ok: '/d' } });
    expect(callsTo('/auth/refresh')).toHaveLength(2);
  });
});
