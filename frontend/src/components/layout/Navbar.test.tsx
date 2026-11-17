import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '@/components/layout/Navbar';
import { UserMenu } from '@/components/layout/UserMenu';
import { useAuthStore } from '@/lib/store/auth-store';

const alice = { id: 'u1', username: 'alice', email: 'alice@example.com', avatar: null };
const logout = vi.fn();

beforeEach(() => {
  // The store stays real; only the network-calling action is replaced.
  useAuthStore.setState({ user: null, accessToken: null, status: 'idle', logout });
});

describe('Navbar', () => {
  it.each(['idle', 'loading'] as const)('shows neither sign-in links nor a user menu while %s', (status) => {
    useAuthStore.setState({ status });
    render(<Navbar />);

    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'alice' })).not.toBeInTheDocument();
  });

  it('offers sign in and register when signed out', () => {
    useAuthStore.setState({ status: 'unauthenticated' });
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
  });

  it('shows the user menu instead when signed in', () => {
    useAuthStore.setState({ status: 'authenticated', user: alice });
    render(<Navbar />);

    expect(screen.getByRole('button', { name: 'alice' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
  });
});

describe('UserMenu', () => {
  async function openMenu(user = alice) {
    const events = userEvent.setup({ delay: null });
    render(<UserMenu user={user} />);
    await events.click(screen.getByRole('button', { name: user.username }));
    return events;
  }

  it('is a button named just by the username (the avatar is decorative there)', () => {
    render(<UserMenu user={{ ...alice, avatar: 'https://cdn.example/a.png' }} />);

    expect(screen.getByRole('button', { name: 'alice' })).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('links to the profile page', async () => {
    await openMenu();

    expect(await screen.findByRole('menuitem', { name: 'Profile' })).toHaveAttribute('href', '/profile');
  });

  it('logs out from the menu', async () => {
    const events = await openMenu();

    await events.click(await screen.findByRole('menuitem', { name: 'Log out' }));

    expect(logout).toHaveBeenCalledOnce();
  });

  it('is operable from the keyboard', async () => {
    const events = userEvent.setup({ delay: null });
    render(<UserMenu user={alice} />);

    screen.getByRole('button', { name: 'alice' }).focus();
    await events.keyboard('{Enter}');
    const logOut = await screen.findByRole('menuitem', { name: 'Log out' });
    // Arrow down to "Log out" without assuming which item the menu highlights on open.
    for (let i = 0; i < 3 && document.activeElement !== logOut; i++) await events.keyboard('{ArrowDown}');
    expect(logOut).toHaveFocus();
    await events.keyboard('{Enter}');

    await vi.waitFor(() => expect(logout).toHaveBeenCalledOnce());
  });
});
