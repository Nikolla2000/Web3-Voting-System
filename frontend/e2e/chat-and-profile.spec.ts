import { expect, test } from './support/test';

const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

test.describe('poll assistant', () => {
  test.beforeEach(async ({ context, gateway }) => {
    await gateway.signIn(context, gateway.addUser());
  });

  test('streams answers over SSE and sends the conversation so far', async ({ page, gateway }) => {
    gateway.chatReply = (message) =>
      message.startsWith('Which')
        ? ['The bike lane poll ', 'has the most votes.']
        : ['It ends on Friday.'];
    await page.goto('/polls');

    await page.getByRole('button', { name: 'Open poll assistant' }).click();
    const conversation = page.getByRole('log', { name: 'Conversation' });
    await page.getByPlaceholder('Ask a question…').fill('Which poll has the most votes?');
    await page.keyboard.press('Enter');
    await expect(conversation).toContainText('Assistant: The bike lane poll has the most votes.');

    await page.getByPlaceholder('Ask a question…').fill('When does it end?');
    await page.keyboard.press('Enter');
    await expect(conversation).toContainText('Assistant: It ends on Friday.');

    const [, second] = gateway.requestsTo('POST', '/polls/chat');
    expect(second!.json).toEqual({
      message: 'When does it end?',
      history: [
        { role: 'user', content: 'Which poll has the most votes?' },
        { role: 'model', content: 'The bike lane poll has the most votes.' },
      ],
    });
  });

  test('keeps working after the access token expires', async ({ page, gateway }) => {
    gateway.chatReply = () => ['Still here.'];
    await page.goto('/polls');
    await page.getByRole('button', { name: 'Open poll assistant' }).click();

    gateway.expireAccessTokens();
    await page.getByPlaceholder('Ask a question…').fill('Hello?');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('log', { name: 'Conversation' })).toContainText(
      'Assistant: Still here.',
    );
    const statuses = gateway.requestsTo('POST', '/polls/chat').length;
    expect(statuses).toBe(2); // the 401, then the retry after one refresh
  });

  test('is not offered to signed-out visitors', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/polls');

    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open poll assistant' })).toHaveCount(0);
  });
});

test.describe('profile', () => {
  test('uploads an avatar straight to the presigned URL, then confirms it', async ({
    page,
    context,
    gateway,
  }) => {
    const user = gateway.addUser();
    await gateway.signIn(context, user);
    await page.goto('/profile');
    await expect(page.getByRole('heading', { level: 1, name: 'alice' })).toBeVisible();

    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: PNG_BYTES });

    await expect(page.getByRole('img', { name: "alice's avatar" }).first()).toBeVisible();
    const [put] = gateway.requestsTo('PUT', /^R2 \/avatars\//);
    expect(put!.headers['content-type']).toBe('image/png');
    // A different origin: our access token must never be sent to the bucket.
    expect(put!.headers['authorization']).toBeUndefined();
    expect(put!.body!.equals(PNG_BYTES)).toBe(true);
    expect(user.avatar).toMatch(/\/avatars\/.+\.png$/);
  });
});

test.describe('signing out on a shared computer', () => {
  test('the next person to sign in never sees the previous user’s cached profile', async ({
    page,
    gateway,
  }) => {
    gateway.addUser();
    gateway.addUser({ username: 'bob', email: 'bob@example.com' });
    const signIn = async (email: string) => {
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill('Secret123');
      await page.getByRole('button', { name: 'Sign in' }).click();
    };

    await page.goto('/profile');
    await signIn('alice@example.com');
    await expect(page.getByRole('heading', { level: 1, name: 'alice' })).toBeVisible();
    await page.getByRole('button', { name: 'alice' }).click();
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page).toHaveURL('/sign-in?next=%2Fprofile');

    // Hold Bob's profile request, so whatever the page shows meanwhile can only come from cache.
    let release!: () => void;
    const released = new Promise<void>((resolve) => (release = resolve));
    let held!: () => void;
    const requestHeld = new Promise<void>((resolve) => (held = resolve));
    await page.route('**/users/me', async (route) => {
      if (route.request().method() === 'GET') {
        held();
        await released;
      }
      await route.fallback();
    });

    await signIn('bob@example.com'); // same tab: a client-side navigation back to /profile
    await requestHeld;
    await expect(page).toHaveURL('/profile');
    await expect(page.getByText('alice', { exact: true })).toHaveCount(0);
    await expect(page.getByText('alice@example.com')).toHaveCount(0);

    release();
    await expect(page.getByRole('heading', { level: 1, name: 'bob' })).toBeVisible();
  });
});
