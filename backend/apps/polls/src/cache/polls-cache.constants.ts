// Single source of truth for poll-detail cache keys/TTL — shared between
// PollsService (read + populate) and the event consumers that invalidate it
// (vote-sync, poll-contract-deployed) so the format can't drift between them.
export const POLL_DETAIL_CACHE_TTL_SECONDS = 60;

export function pollDetailCacheKey(pollId: string): string {
  return `poll:${pollId}`;
}
