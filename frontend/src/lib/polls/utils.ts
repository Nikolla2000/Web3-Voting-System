import type { Poll, PollCategory, PollOption, PollSortOption, PollStatus } from '@/types/poll';

export const POLL_CATEGORY_LABELS: Record<PollCategory, string> = {
  governance: 'Governance',
  treasury: 'Treasury',
  technical: 'Technical',
  community: 'Community',
};

/**
 * Determines the current status of a poll based on its start and end dates.
 */
export function getPollStatus(poll: Pick<Poll, 'startsAt' | 'endsAt'>): PollStatus {
  const now = Date.now();
  const startsAt = new Date(poll.startsAt).getTime();
  const endsAt = new Date(poll.endsAt).getTime();

  if (now < startsAt) return 'upcoming';
  if (now >= endsAt) return 'ended';
  return 'active';
}

export function getTotalVotes(options: PollOption[]): number {
  return options.reduce((sum, option) => sum + option.votes, 0);
}

export function getVotePercentage(votes: number, totalVotes: number): number {
  if (totalVotes === 0) return 0;
  return Math.round((votes / totalVotes) * 100);
}

export function getLeadingOptionId(options: PollOption[]): string | null {
  if (options.length === 0) return null;

  return options.reduce((leader, option) => (option.votes > leader.votes ? option : leader)).id;
}

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function formatRelative(diffMs: number): string {
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffMinutes = diffMs / (1000 * 60);

  if (Math.abs(diffDays) >= 1) return relativeTime.format(Math.round(diffDays), 'day');
  if (Math.abs(diffHours) >= 1) return relativeTime.format(Math.round(diffHours), 'hour');
  return relativeTime.format(Math.round(diffMinutes), 'minute');
}

/** "Ends in 3 days" / "Ends in 6 hours" / "Ended 2 days ago" */
export function formatDeadline(endsAt: string, status: PollStatus): string {
  const diffMs = new Date(endsAt).getTime() - Date.now();
  const prefix = status === 'ended' ? 'Ended' : 'Ends';
  return `${prefix} ${formatRelative(diffMs)}`;
}

/** "Starts in 2 days" — за анкети, които още не са отворени. */
export function formatStartCountdown(startsAt: string): string {
  const diffMs = new Date(startsAt).getTime() - Date.now();
  return `Starts ${formatRelative(diffMs)}`;
}

const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export function formatVoteCount(count: number): string {
  return compactNumber.format(count);
}

export function sortPolls(polls: Poll[], sortBy: PollSortOption): Poll[] {
  const sorted = [...polls];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
    case 'endingSoon':
      return sorted.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
    case 'mostVotes':
      return sorted.sort((a, b) => getTotalVotes(b.options) - getTotalVotes(a.options));
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

interface FilterPollsParams {
  query: string;
  status: PollStatus | 'all';
}

export function filterPolls(polls: Poll[], { query, status }: FilterPollsParams): Poll[] {
  const normalizedQuery = query.trim().toLowerCase();

  return polls.filter((poll) => {
    const matchesQuery = normalizedQuery.length === 0 || poll.title.toLowerCase().includes(normalizedQuery);
    const matchesStatus = status === 'all' || getPollStatus(poll) === status;

    return matchesQuery && matchesStatus;
  });
}