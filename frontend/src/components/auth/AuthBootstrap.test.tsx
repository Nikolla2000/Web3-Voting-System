import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import type { InternalAxiosRequestConfig } from 'axios';
import { AuthBootstrap } from '@/components/auth/AuthBootstrap';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth-store';
import { respond } from '@/test/axios-adapter';

const envelope = <T,>(data: T) => ({ data, statusCode: 200, success: true, timestamp: '' });
const alice = { id: 'u1', username: 'alice', email: 'alice@example.com', avatar: null };

const originalAdapter = apiClient.defaults.adapter;
const initialState = useAuthStore.getState();

function serve(handler: (config: InternalAxiosRequestConfig) => unknown) {
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => handler(config));
  apiClient.defaults.adapter = adapter as never;
  return adapter;
}

beforeEach(() => {
  useAuthStore.setState({ ...initialState, user: null, accessToken: null, status: 'idle' });
});
afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
});

describe('AuthBootstrap', () => {
  it('renders nothing and restores the session from the refresh cookie on mount', async () => {
    const adapter = serve((config) =>
      config.url === '/auth/refresh'
        ? respond(config, 200, envelope({ accessToken: 'access-1' }))
        : respond(config, 200, envelope(alice)),
    );

    const { container } = render(<AuthBootstrap />);

    expect(container).toBeEmptyDOMElement();
    await vi.waitFor(() => expect(useAuthStore.getState().status).toBe('authenticated'));
    expect(useAuthStore.getState()).toMatchObject({ accessToken: 'access-1', user: alice });
    expect(adapter.mock.calls.map(([c]) => c.url)).toEqual(['/auth/refresh', '/users/me']);
  });

  it('settles as signed out when there is no session to restore', async () => {
    serve((config) => respond(config, 401, { message: 'No refresh token' }));

    render(<AuthBootstrap />);

    await vi.waitFor(() => expect(useAuthStore.getState().status).toBe('unauthenticated'));
    expect(useAuthStore.getState()).toMatchObject({ accessToken: null, user: null });
  });

  it('sends one refresh even when StrictMode mounts it twice (the refresh token is single-use)', async () => {
    const adapter = serve((config) =>
      config.url === '/auth/refresh'
        ? respond(config, 200, envelope({ accessToken: 'access-1' }))
        : respond(config, 200, envelope(alice)),
    );

    render(
      <StrictMode>
        <AuthBootstrap />
      </StrictMode>,
    );

    await vi.waitFor(() => expect(useAuthStore.getState().status).toBe('authenticated'));
    expect(adapter.mock.calls.filter(([c]) => c.url === '/auth/refresh')).toHaveLength(1);
  });

  it('does not restart the session check on re-render', () => {
    const bootstrap = vi.fn();
    useAuthStore.setState({ bootstrap });

    const { rerender } = render(<AuthBootstrap />);
    rerender(<AuthBootstrap />);

    expect(bootstrap).toHaveBeenCalledOnce();
  });
});
