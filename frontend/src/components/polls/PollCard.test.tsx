import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { PollCard } from '@/components/polls/PollCard';
import { pollFixture } from '@/test/fixtures';

const NOW = new Date('2026-06-01T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const at = (offsetDays: number) => new Date(NOW.getTime() + offsetDays * DAY).toISOString();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe('PollCard', () => {
  it('links to the poll, named by its title once (the cover image is decorative)', () => {
    render(<PollCard poll={pollFixture({ id: 'poll-42' })} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/polls/poll-42');
    expect(link.textContent?.match(/Best city for a weekend trip\?/g)).toHaveLength(1);
    expect(link.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('shows status, category, total votes, and each option’s share', () => {
    render(<PollCard poll={pollFixture()} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Travel')).toBeInTheDocument();
    expect(screen.getByText('15 votes')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument(); // Lisbon 10/15
    expect(screen.getByText('33%')).toBeInTheDocument(); // Prague 5/15
  });

  it('shows at most four options and counts the rest', () => {
    const options = ['A', 'B', 'C', 'D', 'E', 'F'].map((label, i) => ({
      id: `o${i}`,
      label,
      votes: 0,
    }));
    render(<PollCard poll={pollFixture({ options })} />);

    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.queryByText('E')).not.toBeInTheDocument();
    expect(screen.getByText('+2 more options')).toBeInTheDocument();
  });

  it('highlights no option as leading before anyone has voted', () => {
    const options = [
      { id: 'a', label: 'Yes', votes: 0 },
      { id: 'b', label: 'No', votes: 0 },
    ];
    render(<PollCard poll={pollFixture({ options })} />);

    for (const label of ['Yes', 'No'])
      expect(screen.getByText(label)).not.toHaveClass('font-semibold');
    expect(screen.getAllByText('0%')).toHaveLength(2);
  });

  it.each([
    ['upcoming', { startsAt: at(2), endsAt: at(5) }, 'Upcoming', /^Starts in 2 days$/],
    ['active', { startsAt: at(-1), endsAt: at(3) }, 'Active', /in 3 days/],
    ['ended', { startsAt: at(-5), endsAt: at(-1) }, 'Ended', /1 day ago|yesterday/],
  ])('labels an %s poll and its timing', (_label, dates, badge, timing) => {
    render(<PollCard poll={pollFixture(dates)} />);
    const link = screen.getByRole('link');

    expect(within(link).getByText(badge)).toBeInTheDocument();
    expect(within(link).getByText(timing)).toBeInTheDocument();
  });
});
