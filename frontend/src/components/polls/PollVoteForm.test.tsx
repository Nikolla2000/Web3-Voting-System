import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PollVoteForm } from '@/components/polls/PollVoteForm';
import { useCastVote } from '@/lib/voting/use-cast-vote';
import type { Poll } from '@/types/poll';

// The orchestration itself is covered in use-cast-vote.test.tsx; here we only drive the hook's
// outward state to check what the form renders for each stage.
vi.mock('@/lib/voting/use-cast-vote', () => ({ useCastVote: vi.fn() }));

type HookState = ReturnType<typeof useCastVote>;
const castVote = vi.fn();

function hookState(overrides: Partial<HookState> = {}): HookState {
  return {
    castVote,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    transactionHash: undefined,
    reset: vi.fn(),
    step: null,
    stepLabel: null,
    ...overrides,
  };
}

const poll: Poll = {
  id: 'poll-1',
  title: 'Best city?',
  description: '',
  imageUrl: '',
  category: 'travel',
  startsAt: '2026-01-01T00:00:00Z',
  endsAt: '2027-01-01T00:00:00Z',
  contractAddress: '0x0',
  options: [
    { id: 'opt-lisbon', label: 'Lisbon', votes: 0 },
    { id: 'opt-prague', label: 'Prague', votes: 0 },
  ],
};

beforeEach(() => {
  vi.mocked(useCastVote).mockReturnValue(hookState());
});

describe('PollVoteForm', () => {
  it('keeps “Cast vote” disabled until an option is picked, then votes for that option', async () => {
    const user = userEvent.setup();
    render(<PollVoteForm poll={poll} />);
    const cast = screen.getByRole('button', { name: 'Cast vote' });

    expect(cast).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Prague' }));
    expect(screen.getByRole('radio', { name: 'Prague' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Lisbon' })).toHaveAttribute('aria-checked', 'false');
    expect(cast).toBeEnabled();

    await user.click(cast);
    expect(castVote).toHaveBeenCalledWith('opt-prague');
  });

  it('locks the form and shows the current step while a vote is in flight', () => {
    vi.mocked(useCastVote).mockReturnValue(
      hookState({ isPending: true, step: 'proving', stepLabel: 'Generating zero-knowledge proof…' }),
    );
    render(<PollVoteForm poll={poll} />);

    expect(screen.getByText('Generating zero-knowledge proof…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Casting vote…' })).toBeDisabled();
    for (const option of screen.getAllByRole('radio')) {
      expect(option).toBeDisabled();
    }
  });

  it('shows a readable error after a failed vote and lets the user retry', () => {
    vi.mocked(useCastVote).mockReturnValue(hookState({ isError: true, error: new Error('proof failed') }));
    render(<PollVoteForm poll={poll} />);

    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')[0]).toBeEnabled();
  });

  it('replaces the form with a success view linking to the transaction', () => {
    vi.mocked(useCastVote).mockReturnValue(hookState({ isSuccess: true, transactionHash: '0xdeadbeef' }));
    render(<PollVoteForm poll={poll} />);

    expect(screen.queryByRole('button', { name: 'Cast vote' })).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://sepolia.etherscan.io/tx/0xdeadbeef');
  });
});
