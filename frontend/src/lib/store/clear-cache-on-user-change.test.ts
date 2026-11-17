import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';
import { clearCacheOnUserChange } from '@/lib/store/clear-cache-on-user-change';

const alice = { id: 'u1', username: 'alice', email: 'alice@example.com', avatar: null };
const bob = { id: 'u2', username: 'bob', email: 'bob@example.com', avatar: null };

let queryClient: QueryClient;
let unsubscribe: () => void;

function cachedKeys() {
  return queryClient.getQueryCache().getAll().map((q) => q.queryKey);
}

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, status: 'unauthenticated' });
  queryClient = new QueryClient();
  unsubscribe = clearCacheOnUserChange(queryClient);
});
afterEach(() => unsubscribe());

describe('clearCacheOnUserChange', () => {
  it.each([
    // Every way a session ends (log out, sign out everywhere, deactivate, expiry) lands here.
    ['the session ending', { user: null, accessToken: null, status: 'unauthenticated' as const }],
    ['a different user taking over', { user: bob, accessToken: 'access-2', status: 'authenticated' as const }],
  ])('empties the cache on %s', (_name, next) => {
    useAuthStore.setState({ user: alice, accessToken: 'access-1', status: 'authenticated' });
    queryClient.setQueryData(['profile'], { username: 'alice' });

    useAuthStore.setState(next);

    expect(cachedKeys()).toEqual([]);
  });

  it('keeps the cache when someone signs in from signed out (only public data is cached)', () => {
    queryClient.setQueryData(['polls'], { items: [] });

    useAuthStore.setState({ user: alice, accessToken: 'access-1', status: 'authenticated' });

    expect(cachedKeys()).toEqual([['polls']]);
  });

  it('keeps the cache when the same user’s token is refreshed or their profile edited', () => {
    useAuthStore.setState({ user: alice, accessToken: 'access-1', status: 'authenticated' });
    queryClient.setQueryData(['profile'], { username: 'alice' });

    useAuthStore.setState({ accessToken: 'access-2' });
    useAuthStore.setState({ user: { ...alice, username: 'alice_2' } });

    expect(cachedKeys()).toEqual([['profile']]);
  });

  it('stops listening once unsubscribed', () => {
    useAuthStore.setState({ user: alice, accessToken: 'access-1', status: 'authenticated' });
    queryClient.setQueryData(['profile'], { username: 'alice' });
    unsubscribe();

    useAuthStore.setState({ user: null, status: 'unauthenticated' });

    expect(cachedKeys()).toEqual([['profile']]);
  });
});
