import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthResponseData, AuthUser } from '@/lib/api/auth';

vi.mock('@/lib/api/auth', () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  refreshRequest: vi.fn(),
  logoutRequest: vi.fn(),
  fetchMe: vi.fn(),
}));

const user: AuthUser = { id: 'u1', username: 'alice', email: 'alice@example.com', avatar: null };
const authResponse: AuthResponseData = { user, accessToken: 'access-1' };

/** The store is a module-level singleton, so each test gets a fresh one. */
async function setup() {
  vi.resetModules();
  const api = vi.mocked(await import('@/lib/api/auth'));
  const { useAuthStore } = await import('@/lib/store/auth-store');
  return { api, useAuthStore };
}

const snapshot = (state: { user: unknown; accessToken: unknown; status: unknown }) => ({
  user: state.user,
  accessToken: state.accessToken,
  status: state.status,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auth store', () => {
  it('starts idle with no user or token', async () => {
    const { useAuthStore } = await setup();
    expect(snapshot(useAuthStore.getState())).toEqual({ user: null, accessToken: null, status: 'idle' });
  });

  describe('bootstrap', () => {
    it('restores the session from the refresh cookie: loading → authenticated', async () => {
      const { api, useAuthStore } = await setup();
      api.refreshRequest.mockResolvedValue('access-from-cookie');
      api.fetchMe.mockResolvedValue(user);

      const pending = useAuthStore.getState().bootstrap();
      expect(useAuthStore.getState().status).toBe('loading');
      await pending;

      expect(snapshot(useAuthStore.getState())).toEqual({
        user,
        accessToken: 'access-from-cookie',
        status: 'authenticated',
      });
    });

    it('sets the token before fetching the profile, so /users/me is authorised', async () => {
      const { api, useAuthStore } = await setup();
      api.refreshRequest.mockResolvedValue('access-from-cookie');
      let tokenSeenByFetchMe: string | null = null;
      api.fetchMe.mockImplementation(async () => {
        tokenSeenByFetchMe = useAuthStore.getState().accessToken;
        return user;
      });

      await useAuthStore.getState().bootstrap();

      expect(tokenSeenByFetchMe).toBe('access-from-cookie');
    });

    it('ends unauthenticated, not stuck loading, when there is no valid refresh cookie', async () => {
      const { api, useAuthStore } = await setup();
      api.refreshRequest.mockRejectedValue(new Error('401'));

      await useAuthStore.getState().bootstrap();

      expect(snapshot(useAuthStore.getState())).toEqual({ user: null, accessToken: null, status: 'unauthenticated' });
      expect(api.fetchMe).not.toHaveBeenCalled();
    });

    // Regression: fetchMe used to swallow its own errors and return null, so a failed profile
    // load after a good refresh left the store 'authenticated' with user: null.
    it('ends unauthenticated, with the token dropped, when the profile cannot be loaded', async () => {
      const { api, useAuthStore } = await setup();
      api.refreshRequest.mockResolvedValue('access-from-cookie');
      api.fetchMe.mockRejectedValue(new Error('500'));

      await useAuthStore.getState().bootstrap();

      expect(snapshot(useAuthStore.getState())).toEqual({ user: null, accessToken: null, status: 'unauthenticated' });
    });
  });

  describe('login', () => {
    it('stores the user and the access token', async () => {
      const { api, useAuthStore } = await setup();
      api.loginRequest.mockResolvedValue(authResponse);

      await useAuthStore.getState().login({ email: user.email, password: 'Secret123' });

      expect(api.loginRequest).toHaveBeenCalledWith({ email: user.email, password: 'Secret123' });
      expect(snapshot(useAuthStore.getState())).toEqual({ user, accessToken: 'access-1', status: 'authenticated' });
    });

    it('rethrows on failure (so the form can show the error) and leaves state untouched', async () => {
      const { api, useAuthStore } = await setup();
      const failure = new Error('Invalid credentials');
      api.loginRequest.mockRejectedValue(failure);

      await expect(useAuthStore.getState().login({ email: user.email, password: 'x' })).rejects.toBe(failure);
      expect(snapshot(useAuthStore.getState())).toEqual({ user: null, accessToken: null, status: 'idle' });
    });
  });

  describe('register', () => {
    // Regression: register used to drop the access token, leaving status 'authenticated' with no
    // token, so the first protected request only worked via a silent 401 → refresh round trip.
    it('stores the access token returned by registration, like login does', async () => {
      const { api, useAuthStore } = await setup();
      api.registerRequest.mockResolvedValue(authResponse);

      await useAuthStore.getState().register({ username: 'alice', email: user.email, password: 'Secret123' });

      expect(snapshot(useAuthStore.getState())).toEqual({ user, accessToken: 'access-1', status: 'authenticated' });
    });
  });

  describe('logout', () => {
    it('clears the user and the in-memory token', async () => {
      const { api, useAuthStore } = await setup();
      api.logoutRequest.mockResolvedValue();
      useAuthStore.setState({ user, accessToken: 'access-1', status: 'authenticated' });

      await useAuthStore.getState().logout();

      expect(api.logoutRequest).toHaveBeenCalledOnce();
      expect(snapshot(useAuthStore.getState())).toEqual({ user: null, accessToken: null, status: 'unauthenticated' });
    });

    // Regression: a failed server call used to reject before clearing anything, leaving the user
    // signed in after clicking "Sign out" (and an unhandled rejection from the menu item).
    it('still signs out locally, without rejecting, when the server call fails', async () => {
      const { api, useAuthStore } = await setup();
      api.logoutRequest.mockRejectedValue(new Error('Network Error'));
      useAuthStore.setState({ user, accessToken: 'access-1', status: 'authenticated' });

      await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();

      expect(snapshot(useAuthStore.getState())).toEqual({ user: null, accessToken: null, status: 'unauthenticated' });
    });
  });

  describe('handleSessionExpired', () => {
    it('clears the session and sends the user to sign-in', async () => {
      const assign = vi.fn();
      vi.stubGlobal('location', { ...window.location, assign });
      const { useAuthStore } = await setup();
      useAuthStore.setState({ user, accessToken: 'access-1', status: 'authenticated' });

      useAuthStore.getState().handleSessionExpired();

      expect(snapshot(useAuthStore.getState())).toEqual({ user: null, accessToken: null, status: 'unauthenticated' });
      expect(assign).toHaveBeenCalledWith('/sign-in');
    });

    it('brings the user back to the page they were on once they sign in again', async () => {
      const assign = vi.fn();
      vi.stubGlobal('location', { pathname: '/polls/abc', search: '?tab=results', hash: '', assign });
      const { useAuthStore } = await setup();

      useAuthStore.getState().handleSessionExpired();

      expect(assign).toHaveBeenCalledWith('/sign-in?next=%2Fpolls%2Fabc%3Ftab%3Dresults');
    });
  });
});
