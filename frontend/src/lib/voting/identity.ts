import { Identity } from '@semaphore-protocol/identity';

/**
 * A Semaphore identity is a private key generated entirely client-side — the
 * server never sees it, only the derived public `commitment`. Unlike the
 * access token (zustand, memory-only by design, see CLAUDE.md), this is
 * deliberately persisted: it's a different threat model. Leaking it doesn't
 * compromise the account, only unlinks/relinks this one anonymous voting
 * identity, and losing it on refresh would mean re-registering (and, once
 * you've actually voted, being permanently locked out of that poll — the
 * backend allows exactly one identity commitment per user per poll).
 */
function storageKey(pollId: string): string {
  return `semaphore-identity:${pollId}`;
}

export function getOrCreateVotingIdentity(pollId: string): Identity {
  const stored = window.localStorage.getItem(storageKey(pollId));
  if (stored) {
    return Identity.import(stored);
  }

  const identity = new Identity();
  window.localStorage.setItem(storageKey(pollId), identity.export());
  return identity;
}
