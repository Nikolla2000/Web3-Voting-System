import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Poll, PollOption } from '@/types/poll';
import {
  filterPolls,
  formatDeadline,
  getLeadingOptionId,
  getPollStatus,
  getVotePercentage,
  sortPolls,
} from '@/lib/polls/utils';

const NOW = new Date('2026-06-01T12:00:00Z').getTime();
const HOUR = 60 * 60 * 1000;
const at = (offsetMs: number) => new Date(NOW + offsetMs).toISOString();

function poll(overrides: Partial<Poll>): Poll {
  return {
    id: 'p',
    title: 'Poll',
    description: '',
    imageUrl: '',
    category: 'other',
    startsAt: at(-HOUR),
    endsAt: at(HOUR),
    contractAddress: '',
    options: [],
    ...overrides,
  };
}

const option = (id: string, votes: number): PollOption => ({ id, label: id, votes });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe('getPollStatus', () => {
  it('is upcoming before start, active from start, ended from the end instant', () => {
    expect(getPollStatus({ startsAt: at(1), endsAt: at(HOUR) })).toBe('upcoming');
    expect(getPollStatus({ startsAt: at(0), endsAt: at(HOUR) })).toBe('active');
    expect(getPollStatus({ startsAt: at(-HOUR), endsAt: at(0) })).toBe('ended');
  });
});

describe('vote maths', () => {
  it('returns 0% for a poll with no votes instead of NaN', () => {
    expect(getVotePercentage(0, 0)).toBe(0);
  });

  it('rounds percentages to whole numbers', () => {
    expect(getVotePercentage(1, 3)).toBe(33);
    expect(getVotePercentage(2, 3)).toBe(67);
  });

  it('picks the leading option; ties keep the first one; no options → null', () => {
    expect(getLeadingOptionId([option('a', 1), option('b', 5), option('c', 2)])).toBe('b');
    expect(getLeadingOptionId([option('a', 3), option('b', 3)])).toBe('a');
    expect(getLeadingOptionId([])).toBeNull();
  });
});

describe('formatDeadline', () => {
  it('phrases future and past deadlines', () => {
    expect(formatDeadline(at(3 * 24 * HOUR), 'active')).toBe('Ends in 3 days');
    expect(formatDeadline(at(-2 * 24 * HOUR), 'ended')).toBe('Ended 2 days ago');
    expect(formatDeadline(at(6 * HOUR), 'active')).toBe('Ends in 6 hours');
  });
});

describe('sortPolls / filterPolls', () => {
  const a = poll({
    id: 'a',
    title: 'Banana',
    startsAt: at(-3 * HOUR),
    endsAt: at(5 * HOUR),
    options: [option('x', 1)],
  });
  const b = poll({
    id: 'b',
    title: 'apple',
    startsAt: at(-1 * HOUR),
    endsAt: at(9 * HOUR),
    options: [option('x', 9)],
  });
  const c = poll({
    id: 'c',
    title: 'Cherry',
    startsAt: at(2 * HOUR),
    endsAt: at(3 * HOUR),
    options: [option('x', 4)],
  });
  const polls = [a, b, c];
  const ids = (list: Poll[]) => list.map((p) => p.id);

  it.each([
    ['newest', ['c', 'b', 'a']],
    ['endingSoon', ['c', 'a', 'b']],
    ['mostVotes', ['b', 'c', 'a']],
    ['alphabetical', ['b', 'a', 'c']],
  ] as const)('sorts by %s', (sortBy, expected) => {
    expect(ids(sortPolls(polls, sortBy))).toEqual(expected);
  });

  it('does not mutate the input array', () => {
    sortPolls(polls, 'alphabetical');
    expect(ids(polls)).toEqual(['a', 'b', 'c']);
  });

  it('filters by trimmed, case-insensitive title and by computed status', () => {
    expect(ids(filterPolls(polls, { query: '  APP ', status: 'all' }))).toEqual(['b']);
    expect(ids(filterPolls(polls, { query: '', status: 'upcoming' }))).toEqual(['c']);
    expect(ids(filterPolls(polls, { query: 'an', status: 'active' }))).toEqual(['a']);
  });
});
