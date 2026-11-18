import type { Page } from '@playwright/test';
import { expect, test } from './support/test';

const DAY = 24 * 60 * 60 * 1000;
const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

/** A datetime-local value, in the browser's (and this machine's) local time. */
function localDateTime(offsetMs: number) {
  const d = new Date(Date.now() + offsetMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function fillCreatePollForm(page: Page, title = 'Which park needs new benches?') {
  // Wait for the form itself: after a client-side navigation the previous page can still be up,
  // and its "Search polls by title" box would otherwise take the title.
  await expect(page.getByRole('heading', { level: 1, name: 'Create a poll' })).toBeVisible();
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page
    .getByLabel('Description', { exact: true })
    .fill('The city has budget for one park this year.');
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: PNG_BYTES });
  await page.getByLabel('Category').selectOption('lifestyle');
  await page.getByLabel('Starts at').fill(localDateTime(60 * 60 * 1000));
  await page.getByLabel('Ends at').fill(localDateTime(5 * DAY));
  await page.getByRole('textbox', { name: 'Option 1' }).fill('  Riverside  ');
  await page.getByRole('textbox', { name: 'Option 2' }).fill('Hilltop');
}

test.describe('browsing polls', () => {
  test('lists polls, narrows by title, and opens one', async ({ page, gateway }) => {
    const city = gateway.addPoll({
      options: [
        ['Lisbon', 7],
        ['Prague', 3],
      ],
    });
    gateway.addPoll({ title: 'Favourite programming language', category: 'TECH_SCIENCE' });

    await page.goto('/polls');
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(2);

    await page.getByRole('textbox', { name: 'Search polls by title' }).fill('city');
    await expect(page.getByRole('heading', { level: 3 })).toHaveText([city.title]);
    await page.getByRole('link', { name: new RegExp(city.title.replace('?', '\\?')) }).click();

    await expect(page).toHaveURL(`/polls/${city.id}`);
    await expect(page.getByRole('heading', { level: 1, name: city.title })).toBeVisible();
    await expect(page.getByText('10 votes')).toBeVisible();
  });

  test('AI search shows only the matches, in relevance order', async ({ page, gateway }) => {
    const bikes = gateway.addPoll({ title: 'Should the city add bike lanes?' });
    gateway.addPoll({ title: 'Best pizza topping', category: 'FOOD_DRINK' });
    const trains = gateway.addPoll({ title: 'Night trains: worth it?' });
    gateway.searchResults = () => [
      { pollId: trains.id, similarity: 0.9 },
      { pollId: bikes.id, similarity: 0.7 },
    ];

    await page.goto('/polls');
    await page
      .getByRole('textbox', { name: 'Describe the polls you are looking for' })
      .fill('getting around town');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByRole('heading', { level: 3 })).toHaveText([trains.title, bikes.title]);
    expect(gateway.requestsTo('POST', '/polls/search').map((r) => r.json)).toEqual([
      { query: 'getting around town' },
    ]);
  });

  test('“Sign in to vote” brings you back to the poll, ready to vote', async ({
    page,
    gateway,
  }) => {
    gateway.addUser();
    const poll = gateway.addPoll();
    await page.goto(`/polls/${poll.id}`);

    await page.getByRole('link', { name: 'Sign in to vote' }).click();
    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Password').fill('Secret123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(`/polls/${poll.id}`);
    await expect(page.getByRole('button', { name: 'Cast vote' })).toBeVisible();
  });
});

test.describe('creating a poll', () => {
  test.beforeEach(async ({ context, gateway }) => {
    await gateway.signIn(context, gateway.addUser());
  });

  test('uploads the cover as real multipart, creates the poll and opens it', async ({
    page,
    gateway,
  }) => {
    await page.goto('/polls/create');
    await fillCreatePollForm(page);
    await page.getByRole('button', { name: 'Create poll' }).click();

    await expect(
      page.getByRole('heading', { level: 1, name: 'Which park needs new benches?' }),
    ).toBeVisible();
    const created = gateway.polls[0]!;
    await expect(page).toHaveURL(`/polls/${created.id}`);

    // jsdom can't show this: the browser itself sets the multipart boundary.
    const [upload] = gateway.requestsTo('POST', '/polls/images');
    expect(upload!.headers['content-type']).toMatch(/^multipart\/form-data; boundary=/);
    expect(upload!.body!.includes(PNG_BYTES)).toBe(true);
    expect(upload!.body!.toString('latin1')).toContain('filename="cover.png"');

    const [create] = gateway.requestsTo('POST', '/polls');
    expect(create!.json).toMatchObject({
      title: 'Which park needs new benches?',
      category: 'lifestyle',
      options: ['Riverside', 'Hilltop'],
      imageUrl: created.imageUrl,
    });
    // The local datetime-local values went out as UTC instants.
    expect((create!.json as { startsAt: string }).startsAt).toMatch(
      /^\d{4}-\d\d-\d\dT\d\d:\d\d:00\.000Z$/,
    );
  });

  test('warns about a likely duplicate first, and creates only when told to', async ({
    page,
    gateway,
  }) => {
    const existing = gateway.addPoll({ title: 'Which park should get benches?' });
    gateway.duplicateMatches = [{ pollId: existing.id, title: existing.title, similarity: 0.93 }];

    await page.goto('/polls/create');
    await fillCreatePollForm(page);
    await page.getByRole('button', { name: 'Create poll' }).click();

    await expect(page.getByRole('link', { name: existing.title })).toHaveAttribute(
      'href',
      `/polls/${existing.id}`,
    );
    expect(gateway.requestsTo('POST', '/polls')).toHaveLength(0);
    expect(gateway.requestsTo('POST', '/polls/images')).toHaveLength(0); // nothing lands in R2 yet

    await page.getByRole('button', { name: 'Create anyway' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Which park needs new benches?' }),
    ).toBeVisible();
    expect(gateway.requestsTo('POST', '/polls')).toHaveLength(1);
  });

  test('the new poll appears in the list straight away', async ({ page, gateway }) => {
    gateway.addPoll();
    await page.goto('/polls');
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(1);

    await page
      .getByRole('link', { name: /create/i })
      .first()
      .click();
    await fillCreatePollForm(page);
    await page.getByRole('button', { name: 'Create poll' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Which park needs new benches?' }),
    ).toBeVisible();
    // Client-side, as a user would. (This doesn't pin down CreatePollForm's invalidateQueries:
    // with react-query's default staleTime of 0 the list refetches on mount regardless.)
    await page.getByRole('navigation').getByRole('link', { name: 'Polls' }).click();

    await expect(
      page.getByRole('heading', { level: 3, name: 'Which park needs new benches?' }),
    ).toBeVisible();
  });
});
