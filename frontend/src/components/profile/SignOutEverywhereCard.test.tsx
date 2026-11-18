import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { SignOutEverywhereCard } from '@/components/profile/SignOutEverywhereCard';
import { logoutAllRequest } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiError, deferred } from '@/test/axios-adapter';
import { renderWithQuery } from '@/test/render';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/lib/api/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api/auth')>()),
  logoutAllRequest: vi.fn(),
}));

beforeEach(() => {
  useAuthStore.setState({
    user: { id: 'u1', username: 'alice', email: 'alice@example.com', avatar: null },
    accessToken: 'access-1',
    status: 'authenticated',
  });
});

describe('SignOutEverywhereCard', () => {
  it('revokes every session, clears this one, and goes to sign-in', async () => {
    vi.mocked(logoutAllRequest).mockResolvedValue();
    const { user } = renderWithQuery(<SignOutEverywhereCard />);

    await user.click(screen.getByRole('button', { name: 'Sign out everywhere' }));

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/sign-in'));
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
    });
  });

  it('stays signed in and explains when the request fails', async () => {
    vi.mocked(logoutAllRequest).mockRejectedValue(apiError(500, 'Something went wrong'));
    const { user } = renderWithQuery(<SignOutEverywhereCard />);

    await user.click(screen.getByRole('button', { name: 'Sign out everywhere' }));

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(replace).not.toHaveBeenCalled();
  });

  it('locks the button while the request is in flight', async () => {
    vi.mocked(logoutAllRequest).mockReturnValue(deferred<never>().promise);
    const { user } = renderWithQuery(<SignOutEverywhereCard />);

    await user.click(screen.getByRole('button', { name: 'Sign out everywhere' }));

    expect(await screen.findByRole('button', { name: 'Signing out…' })).toBeDisabled();
  });
});
