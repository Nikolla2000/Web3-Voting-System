import { useSyncExternalStore } from 'react';

/**
 * A client-side convenience only — not the source of truth. Even if this is
 * cleared, trying to vote again generates a *new* identity commitment, and
 * the backend's JoinGroup rejects a second, different commitment for a poll
 * this account already joined (ALREADY_EXISTS). This just lets the UI show
 * "you voted" immediately without waiting for that round trip.
 */
function storageKey(pollId: string): string {
  return `voted-tx:${pollId}`;
}

export function getVotedTransactionHash(pollId: string): string | null {
  return window.localStorage.getItem(storageKey(pollId));
}

export function markVoted(pollId: string, transactionHash: string): void {
  window.localStorage.setItem(storageKey(pollId), transactionHash);
}

function noopSubscribe() {
  return () => {};
}

/**
 * localStorage isn't available during SSR and reading it in render would
 * mismatch the server-rendered HTML — useSyncExternalStore is the correct
 * primitive for an external (non-React-owned) source like this, with an
 * explicit server snapshot instead of a render-then-effect workaround.
 */
export function useVotedTransactionHash(pollId: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => getVotedTransactionHash(pollId),
    () => null,
  );
}
