import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { LoginForm } from '@/components/auth/forms/LoginForm';
import { useAuthStore } from '@/lib/store/auth-store';
import { deferred } from '@/test/axios-adapter';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const login = vi.fn();

function apiError(status: number, message: string) {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  return new AxiosError('failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    data: { message },
    headers: {},
    config,
  });
}

function setup() {
  const user = userEvent.setup();
  render(<LoginForm />);
  return {
    user,
    email: screen.getByLabelText('Email'),
    password: screen.getByLabelText('Password'),
    submit: () => user.click(screen.getByRole('button', { name: /sign in/i })),
  };
}

beforeEach(() => {
  // Replace only the network-calling action; the store itself stays real.
  useAuthStore.setState({ login });
});

describe('LoginForm', () => {
  it('shows required-field errors and does not call login when submitted empty', async () => {
    const { submit } = setup();

    await submit();

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    const { user, email, password, submit } = setup();

    await user.type(email, 'not-an-email');
    await user.type(password, 'whatever');
    await submit();

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in with the entered credentials and redirects home', async () => {
    login.mockResolvedValue(undefined);
    const { user, email, password, submit } = setup();

    await user.type(email, 'alice@example.com');
    await user.type(password, 'Secret123');
    await submit();

    expect(login).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'Secret123' });
    expect(push).toHaveBeenCalledWith('/');
  });

  it('shows the server’s message on failure and stays on the page', async () => {
    login.mockRejectedValue(apiError(401, 'Invalid email or password'));
    const { user, email, password, submit } = setup();

    await user.type(email, 'alice@example.com');
    await user.type(password, 'wrong');
    await submit();

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('shows a rate-limit countdown when the gateway throttles the attempt', async () => {
    const throttled = apiError(429, 'ThrottlerException');
    throttled.response!.headers = { 'retry-after': '30' };
    login.mockRejectedValue(throttled);
    const { user, email, password, submit } = setup();

    await user.type(email, 'alice@example.com');
    await user.type(password, 'wrong');
    await submit();

    expect(await screen.findByText('Too many requests — try again in 30s.')).toBeInTheDocument();
  });

  it('falls back to a generic message for non-API errors, and clears it on the next attempt', async () => {
    login.mockRejectedValueOnce(new Error('network down'));
    const pending = deferred<void>();
    login.mockReturnValueOnce(pending.promise);
    const { user, email, password, submit } = setup();

    await user.type(email, 'alice@example.com');
    await user.type(password, 'Secret123');
    await submit();
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();

    await submit();
    expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeInTheDocument();

    pending.resolve();
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});
