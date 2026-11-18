import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { PollsExplorer } from '@/components/polls/PollsExplorer';
import { fetchPollById, fetchPolls } from '@/lib/api/polls';
import { searchPolls } from '@/lib/api/ai';
import { apiError, deferred } from '@/test/axios-adapter';
import { pollFixture } from '@/test/fixtures';
import { renderWithQuery } from '@/test/render';

vi.mock('@/lib/api/polls', () => ({ fetchPolls: vi.fn(), fetchPollById: vi.fn() }));
vi.mock('@/lib/api/ai', () => ({ searchPolls: vi.fn() }));

// Statuses and relative dates read the clock, so pin it. Only Date is faked: react-query and
// user-event still need real timers.
const NOW = new Date('2026-06-01T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const at = (offsetDays: number) => new Date(NOW.getTime() + offsetDays * DAY).toISOString();

const city = pollFixture({
  id: 'city',
  title: 'Best city for a weekend trip?',
  startsAt: at(-2),
  endsAt: at(3),
}); // active, 15 votes
const language = pollFixture({
  id: 'language',
  title: 'Favourite programming language',
  startsAt: at(2),
  endsAt: at(5),
  options: [
    { id: 'l1', label: 'TypeScript', votes: 0 },
    { id: 'l2', label: 'Rust', votes: 0 },
  ],
}); // upcoming, 0 votes
const bikes = pollFixture({
  id: 'bikes',
  title: 'Should the city add bike lanes?',
  startsAt: at(-10),
  endsAt: at(-1),
  options: [
    { id: 'b1', label: 'Yes', votes: 30 },
    { id: 'b2', label: 'No', votes: 10 },
  ],
}); // ended, 40 votes
const pizza = pollFixture({
  id: 'pizza',
  title: 'Best pizza topping',
  startsAt: at(-1),
  endsAt: at(1),
  options: [
    { id: 'p1', label: 'Margherita', votes: 2 },
    { id: 'p2', label: 'Pepperoni', votes: 1 },
  ],
}); // active, 3 votes

const ALL = [city, language, bikes, pizza];

/** Poll titles in the order the grid shows them. */
function visibleTitles() {
  return screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent);
}

async function setup(polls = ALL) {
  vi.mocked(fetchPolls).mockResolvedValue({ items: polls, total: polls.length });
  const utils = renderWithQuery(<PollsExplorer />);
  await screen.findAllByRole('heading', { level: 3 }).catch(() => undefined);
  const aiInput = screen.getByRole('textbox', { name: 'Describe the polls you are looking for' });
  const aiSearch = async (text: string) => {
    await utils.user.type(aiInput, text);
    await utils.user.click(screen.getByRole('button', { name: 'Search' }));
  };
  return { ...utils, aiInput, aiSearch };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe('PollsExplorer', () => {
  it('shows a loading state, then every poll, newest first', async () => {
    const pending = deferred<{ items: typeof ALL; total: number }>();
    vi.mocked(fetchPolls).mockReturnValue(pending.promise);
    renderWithQuery(<PollsExplorer />);

    expect(screen.getByRole('status', { name: 'Loading polls' })).toBeInTheDocument();
    pending.resolve({ items: ALL, total: 4 });

    expect(
      await screen.findByRole('heading', { name: 'Favourite programming language' }),
    ).toBeInTheDocument();
    expect(visibleTitles()).toEqual([
      'Favourite programming language',
      'Best pizza topping',
      'Best city for a weekend trip?',
      'Should the city add bike lanes?',
    ]);
    expect(fetchPolls).toHaveBeenCalledWith({ limit: 50 });
  });

  it('narrows by title as you type, ignoring case and surrounding spaces', async () => {
    const { user } = await setup();

    await user.type(screen.getByRole('textbox', { name: 'Search polls by title' }), '  BEST ');

    expect(visibleTitles()).toEqual(['Best pizza topping', 'Best city for a weekend trip?']);
  });

  it.each([
    ['Active', ['Best pizza topping', 'Best city for a weekend trip?']],
    ['Upcoming', ['Favourite programming language']],
    ['Ended', ['Should the city add bike lanes?']],
  ])('filters to %s polls and marks that filter as pressed', async (label, titles) => {
    const { user } = await setup();
    const filters = screen.getByRole('group', { name: 'Filter by status' });

    await user.click(within(filters).getByRole('button', { name: label }));

    expect(visibleTitles()).toEqual(titles);
    expect(within(filters).getByRole('button', { name: label })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(filters).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('combines the title search with the status filter', async () => {
    const { user } = await setup();

    await user.type(screen.getByRole('textbox', { name: 'Search polls by title' }), 'city');
    await user.click(screen.getByRole('button', { name: 'Ended' }));

    expect(visibleTitles()).toEqual(['Should the city add bike lanes?']);
  });

  it.each([
    [
      'Ending soon',
      [
        'Should the city add bike lanes?',
        'Best pizza topping',
        'Best city for a weekend trip?',
        'Favourite programming language',
      ],
    ],
    [
      'Most votes',
      [
        'Should the city add bike lanes?',
        'Best city for a weekend trip?',
        'Best pizza topping',
        'Favourite programming language',
      ],
    ],
    [
      'A – Z',
      [
        'Best city for a weekend trip?',
        'Best pizza topping',
        'Favourite programming language',
        'Should the city add bike lanes?',
      ],
    ],
  ])('sorts by %s', async (option, titles) => {
    const { user } = await setup();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), option);

    expect(visibleTitles()).toEqual(titles);
  });

  it('says nothing matches when filters exclude everything', async () => {
    const { user } = await setup();

    await user.type(screen.getByRole('textbox', { name: 'Search polls by title' }), 'quantum');

    expect(visibleTitles()).toEqual([]);
    expect(screen.getByText(/No polls match your search/)).toBeInTheDocument();
  });

  it('invites the first poll when there are none at all', async () => {
    await setup([]);

    expect(await screen.findByText(/No polls have been created yet/)).toBeInTheDocument();
  });

  it('shows the error and recovers on retry', async () => {
    vi.mocked(fetchPolls)
      .mockRejectedValueOnce(apiError(503, 'Polls service is unavailable'))
      .mockResolvedValueOnce({ items: [city], total: 1 });
    const { user } = renderWithQuery(<PollsExplorer />);

    expect(await screen.findByText('Polls service is unavailable')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: city.title })).toBeInTheDocument();
  });

  describe('AI search', () => {
    it('shows the matched polls in relevance order, fetching each one in full', async () => {
      vi.mocked(searchPolls).mockResolvedValue([
        { pollId: 'bikes', similarity: 0.91 },
        { pollId: 'city', similarity: 0.74 },
      ]);
      vi.mocked(fetchPollById).mockImplementation(async (id) => ALL.find((p) => p.id === id)!);
      const { aiSearch } = await setup();

      await aiSearch('  transport in cities  ');

      await vi.waitFor(() =>
        expect(visibleTitles()).toEqual([
          'Should the city add bike lanes?',
          'Best city for a weekend trip?',
        ]),
      );
      expect(searchPolls).toHaveBeenCalledWith('transport in cities');
      expect(vi.mocked(fetchPollById).mock.calls.map(([id]) => id)).toEqual(['bikes', 'city']);
    });

    it('disables the search button and says so while searching', async () => {
      vi.mocked(searchPolls).mockReturnValue(deferred<never>().promise);
      const { aiSearch } = await setup();

      await aiSearch('bikes');

      expect(await screen.findByRole('button', { name: 'Searching…' })).toBeDisabled();
      expect(screen.getByRole('status', { name: 'Loading polls' })).toBeInTheDocument();
    });

    it('needs some text before it can search', async () => {
      const { user, aiInput } = await setup();

      await user.type(aiInput, '   ');

      expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
      expect(searchPolls).not.toHaveBeenCalled();
    });

    it('says nothing matched when the search finds nothing', async () => {
      vi.mocked(searchPolls).mockResolvedValue([]);
      const { aiSearch } = await setup();

      await aiSearch('underwater basket weaving');

      expect(await screen.findByText(/No polls match your search/)).toBeInTheDocument();
    });

    it('clearing returns to the full list at once, from cache, with no loading state', async () => {
      vi.mocked(searchPolls).mockResolvedValue([{ pollId: 'pizza', similarity: 0.9 }]);
      vi.mocked(fetchPollById).mockResolvedValue(pizza);
      const { user, aiInput, aiSearch } = await setup();

      await aiSearch('food');
      await vi.waitFor(() => expect(visibleTitles()).toEqual(['Best pizza topping']));
      await user.click(screen.getByRole('button', { name: 'Clear AI search' }));

      // Shown straight from cache (react-query then revalidates it in the background).
      expect(visibleTitles()).toHaveLength(4);
      expect(screen.queryByRole('status', { name: 'Loading polls' })).not.toBeInTheDocument();
      expect(aiInput).toHaveValue('');
      expect(screen.queryByRole('button', { name: 'Clear AI search' })).not.toBeInTheDocument();
    });

    it('shows a failed search’s error, with a retry that searches again', async () => {
      vi.mocked(searchPolls)
        .mockRejectedValueOnce(apiError(429, 'Too many requests', { 'retry-after': '20' }))
        .mockResolvedValueOnce([{ pollId: 'city', similarity: 0.8 }]);
      vi.mocked(fetchPollById).mockResolvedValue(city);
      const { user, aiSearch } = await setup();

      await aiSearch('travel');

      expect(await screen.findByText('Too many requests — try again in 20s.')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Retry' }));
      await vi.waitFor(() => expect(visibleTitles()).toEqual([city.title]));
    });
  });
});
