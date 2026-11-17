// The pages live in app/, but their test can't: Next's build compiles every file under app/.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPage from '@/app/sign-in/page';
import RegisterPage from '@/app/register/page';
import { useAuthStore } from '@/lib/store/auth-store';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const login = vi.fn();

// The pages are async server components: await them to get the element, then render that.
async function renderPage(Page: typeof SignInPage, params: Record<string, string | string[]>) {
  render(await Page({ searchParams: Promise.resolve(params) }));
}

beforeEach(() => {
  login.mockResolvedValue(undefined);
  useAuthStore.setState({ login });
});

describe('sign-in and register pages', () => {
  it('signs the user in and sends them back to the page in ?next', async () => {
    await renderPage(SignInPage, { next: '/polls/create' });
    const user = userEvent.setup({ delay: null });

    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'Secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(replace).toHaveBeenCalledExactlyOnceWith('/polls/create');
  });

  it('keeps ?next when switching between sign in and register', async () => {
    await renderPage(SignInPage, { next: '/profile' });
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register?next=%2Fprofile');

    await renderPage(RegisterPage, { next: '/profile' });
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in?next=%2Fprofile');
  });

  it('ignores an off-site ?next: goes home after signing in, and does not pass it on', async () => {
    await renderPage(SignInPage, { next: 'https://evil.example' });
    const user = userEvent.setup({ delay: null });

    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'Secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(replace).toHaveBeenCalledExactlyOnceWith('/');
  });
});
