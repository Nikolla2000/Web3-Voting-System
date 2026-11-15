import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PollVoteCard } from '@/components/polls/PollVoteCard';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCastVote } from '@/lib/voting/use-cast-vote';
import type { Poll } from '@/types/poll';

vi.mock('@/lib/voting/use-cast-vote', () => ({ useCastVote: vi.fn() }));

const DAY = 24 * 60 * 60 * 1000;
const fromNow = (ms: number) => new Date(Date.now() + ms).toISOString();

function poll(overrides: Partial<Poll> = {}): Poll {
  return {
    id: 'poll-1',
    title: 'Best city?',
    description: '',
    imageUrl: '',
    category: 'travel',
    startsAt: fromNow(-DAY),
    endsAt: fromNow(DAY),
    contractAddress: '0x0',
    options: [{ id: 'opt-1', label: 'Lisbon', votes: 0 }],
    ...overrides,
  };
}

beforeEach(() => {
  useAuthStore.setState({ status: 'authenticated' });
  vi.mocked(useCastVote).mockReturnValue({
    castVote: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    transactionHash: undefined,
    reset: vi.fn(),
    step: null,
    stepLabel: null,
  });
});

describe('PollVoteCard', () => {
  it.each([
    ['upcoming', { startsAt: fromNow(DAY), endsAt: fromNow(2 * DAY) }, /Voting opens once this poll starts/],
    ['ended', { startsAt: fromNow(-2 * DAY), endsAt: fromNow(-DAY) }, /Voting has closed for this poll/],
  ] as const)('shows a closed notice instead of the form when the poll is %s', (_, dates, copy) => {
    render(<PollVoteCard poll={poll(dates)} />);

    expect(screen.getByText(copy)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cast vote' })).not.toBeInTheDocument();
  });

  it.each(['idle', 'loading'] as const)('renders nothing while auth is %s (avoids a sign-in flash)', (status) => {
    useAuthStore.setState({ status });
    const { container } = render(<PollVoteCard poll={poll()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('asks signed-out visitors to sign in', () => {
    useAuthStore.setState({ status: 'unauthenticated' });
    render(<PollVoteCard poll={poll()} />);

    expect(screen.getByRole('link', { name: 'Sign in to vote' })).toHaveAttribute('href', '/sign-in');
  });

  it('shows the earlier vote’s receipt when this browser already voted on the poll', () => {
    window.localStorage.setItem('voted-tx:poll-1', '0xfeed');
    render(<PollVoteCard poll={poll()} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://sepolia.etherscan.io/tx/0xfeed');
    expect(screen.queryByRole('button', { name: 'Cast vote' })).not.toBeInTheDocument();
  });

  it('shows the vote form to a signed-in user who has not voted', () => {
    render(<PollVoteCard poll={poll()} />);

    expect(screen.getByRole('button', { name: 'Cast vote' })).toBeInTheDocument();
  });
});
