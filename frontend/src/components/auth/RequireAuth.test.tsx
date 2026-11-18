import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/lib/store/auth-store';

// One stable router object, as Next provides: a new one per render would re-run the effect.
const router = { replace: vi.fn() };
vi.mock('next/navigation', () => ({ useRouter: () => router }));

function renderProtected() {
  return render(
    <RequireAuth>
      <h1>Create a poll</h1>
    </RequireAuth>,
  );
}

beforeEach(() => {
  useAuthStore.setState({ status: 'idle', user: null, accessToken: null });
  window.history.replaceState(null, '', '/');
});

describe('RequireAuth', () => {
  it.each(['idle', 'loading'] as const)(
    'while the session is %s, shows a placeholder and neither the page nor a redirect',
    (status) => {
      useAuthStore.setState({ status });
      renderProtected();

      expect(screen.getByRole('status', { name: 'Checking your session' })).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(router.replace).not.toHaveBeenCalled();
    },
  );

  it('shows the page to a signed-in user', () => {
    useAuthStore.setState({ status: 'authenticated' });
    renderProtected();

    expect(screen.getByRole('heading', { name: 'Create a poll' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('sends a signed-out user to sign in, replacing the history entry, without flashing the page', () => {
    useAuthStore.setState({ status: 'unauthenticated' });
    renderProtected();

    expect(router.replace).toHaveBeenCalledExactlyOnceWith('/sign-in');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('asks sign-in to bring the user back to this page, query string included', () => {
    window.history.replaceState(null, '', '/polls/create?category=travel');
    useAuthStore.setState({ status: 'unauthenticated' });
    renderProtected();

    expect(router.replace).toHaveBeenCalledExactlyOnceWith(
      '/sign-in?next=%2Fpolls%2Fcreate%3Fcategory%3Dtravel',
    );
  });

  it('redirects once the session check finishes and finds no session', () => {
    useAuthStore.setState({ status: 'loading' });
    renderProtected();

    act(() => useAuthStore.setState({ status: 'unauthenticated' }));

    expect(router.replace).toHaveBeenCalledExactlyOnceWith('/sign-in');
  });

  it('hides the page and redirects when the user signs out while on it', () => {
    useAuthStore.setState({ status: 'authenticated' });
    renderProtected();

    act(() => useAuthStore.setState({ status: 'unauthenticated', user: null }));

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledExactlyOnceWith('/sign-in');
  });
});
