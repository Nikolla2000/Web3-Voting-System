export const POLLS_EVENTS = {
  POLL_CREATED: 'poll.created',
  /** from blockchain-indexer service after on-chain confirmation. */
  VOTE_CAST: 'vote.cast',
} as const;