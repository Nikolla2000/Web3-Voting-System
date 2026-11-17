import { expect, test } from './support/test';

test.describe('accounts and sessions', () => {
  test('registering signs you in and lands on the polls page', async ({ page, gateway }) => {
    await page.goto('/register');

    await page.getByLabel('Username').fill('bob_99');
    await page.getByLabel('Email').fill('bob@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Secret123');
    await page.getByLabel('Confirm password').fill('Secret123');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL('/polls');
    await expect(page.getByRole('button', { name: 'bob_99' })).toBeVisible();
    // Exactly what the backend's DTO takes: confirmPassword stays in the browser.
    expect(gateway.requestsTo('POST', '/auth/register').map((r) => r.json)).toEqual([
      { username: 'bob_99', email: 'bob@example.com', password: 'Secret123' },
    ]);
  });

  test('a session survives a reload, restored from the httpOnly refresh cookie', async ({ page, gateway }) => {
    gateway.addUser();
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Password').fill('Secret123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('button', { name: 'alice' })).toBeVisible();

    await page.reload();

    // The access token lived only in memory, so the reload must have gone through /auth/refresh.
    await expect(page.getByRole('button', { name: 'alice' })).toBeVisible();
    expect(gateway.requestsTo('POST', '/auth/refresh').length).toBeGreaterThanOrEqual(2);
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'refresh_token')).toMatchObject({ httpOnly: true });
    expect(await page.evaluate(() => document.cookie)).not.toContain('refresh_token');
  });

  test('wrong credentials show the server’s message and stay on sign-in', async ({ page, gateway }) => {
    gateway.addUser();
    await page.goto('/sign-in');

    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Password').fill('not-it');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL('/sign-in');
  });

  test('a protected page sends you to sign in, then back to it afterwards', async ({ page, gateway }) => {
    gateway.addUser();
    await page.goto('/polls/create');

    await expect(page).toHaveURL('/sign-in?next=%2Fpolls%2Fcreate');
    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Password').fill('Secret123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/polls/create');
    await expect(page.getByLabel('Title')).toBeVisible();
    // Sign-in replaced its own history entry, so Back doesn't return to the form.
    await page.goBack();
    await expect(page).not.toHaveURL(/sign-in/);
  });

  test('the return path survives switching to register', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL('/sign-in?next=%2Fprofile');

    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByLabel('Username').fill('carol');
    await page.getByLabel('Email').fill('carol@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Secret123');
    await page.getByLabel('Confirm password').fill('Secret123');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL('/profile');
  });

  test('an off-site return path is ignored', async ({ page, gateway }) => {
    gateway.addUser();
    await page.goto('/sign-in?next=//evil.example/phish');

    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Password').fill('Secret123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/');
  });

  test('logging out from the user menu ends the session for good', async ({ page, context, gateway }) => {
    await gateway.signIn(context, gateway.addUser());
    await page.goto('/profile');
    await expect(page.getByRole('heading', { level: 1, name: 'alice' })).toBeVisible();

    await page.getByRole('button', { name: 'alice' }).click();
    await page.getByRole('menuitem', { name: 'Log out' }).click();

    await expect(page).toHaveURL('/sign-in?next=%2Fprofile');
    // A fresh page load can't restore it: the cookie is gone and the server revoked the token.
    await page.goto('/polls');
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    expect((await context.cookies()).find((c) => c.name === 'refresh_token')).toBeUndefined();
  });

  test('an expired access token is refreshed and the request retried, unnoticed', async ({ page, context, gateway }) => {
    await gateway.signIn(context, gateway.addUser());
    await page.goto('/profile');
    await expect(page.getByLabel('Username')).toHaveValue('alice');

    gateway.expireAccessTokens();
    await page.getByLabel('Username').fill('alice_2');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByRole('button', { name: 'alice_2' })).toBeVisible();
  });
});
