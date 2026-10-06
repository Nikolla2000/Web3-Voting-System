// Single source of truth for poll-detail cache keys/TTL — shared between
// PollsService (read + populate) and the event consumers that invalidate it
// (vote-sync, poll-contract-deployed) so the format can't drift between them.
export const POLL_DETAIL_CACHE_TTL_SECONDS = 60;

export function pollDetailCacheKey(pollId: string): string {
  return `poll:${pollId}`;
}

// Poll listing has a combinatorial key space (search/status/sortBy/page/limit),
// so a single write (new poll, vote tally, contract deployed) can't target one
// specific cached entry the way poll-detail invalidation can. Instead every
// list key embeds a version number; a write just increments the version,
// which orphans every previously-cached listing at once in O(1) rather than
// deleting (or scanning for) each one individually. Orphaned entries fall out
// on their own via the TTL below.
export const POLLS_LIST_CACHE_TTL_SECONDS = 30;

const POLLS_LIST_VERSION_KEY = 'polls:list:version';

export function pollsListVersionKey(): string {
  return POLLS_LIST_VERSION_KEY;
}

export interface PollsListCacheParams {
  status: string;
  sortBy: string;
  page: number;
  limit: number;
  search?: string;
}

export function pollsListCacheKey(version: string | number, params: PollsListCacheParams): string {
  const { status, sortBy, page, limit, search = '' } = params;
  return `polls:list:v${version}:${status}:${sortBy}:${page}:${limit}:${search}`;
}
