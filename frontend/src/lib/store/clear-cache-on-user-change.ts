import type { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Empties react-query's cache whenever the signed-in user goes away or changes.
 *
 * Cached server state belongs to whoever was signed in when it was fetched (their profile, for
 * one). Without this, signing out and letting someone else sign in on the same tab shows them the
 * previous user's data until each query refetches. Hooked on the store rather than on each
 * sign-out path (log out, sign out everywhere, deactivate, session expiry), so a future path
 * can't forget it.
 *
 * Returns the unsubscribe function, for use as an effect's cleanup.
 */
export function clearCacheOnUserChange(queryClient: QueryClient): () => void {
  return useAuthStore.subscribe((state, previous) => {
    const before = previous.user?.id ?? null;
    // Signing in from signed-out (null → id) has nothing stale to clear: what's cached is public.
    if (before !== null && before !== (state.user?.id ?? null)) {
      queryClient.clear();
    }
  });
}
