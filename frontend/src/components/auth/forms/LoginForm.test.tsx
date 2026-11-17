import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { LoginForm } from '@/components/auth/forms/LoginForm';
import { useAuthStore } from '@/lib/store/auth-store';
import { deferred } from '@/test/axios-adapter';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

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

function setup(returnTo?: string | null) {
  const user = userEvent.setup();
  render(<LoginForm returnTo={returnTo} />);
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
  it('shows required-field errors on the fields themselves and does not call login when submitted empty', async () => {
    const { email, password, submit } = setup();

    await submit();

    await vi.waitFor(() => expect(email).toBeInvalid());
    expect(email).toHaveAccessibleDescription('Email is required');
    expect(password).toBeInvalid();
    expect(password).toHaveAccessibleDescription('Password is required');
    expect(login).not.toHaveBeenCalled();
  });

  it('disables the button while signing in, so a double-click sends one request', async () => {
    const pending = deferred<void>();
    login.mockReturnValue(pending.promise);
    const { user, email, password } = setup();

    await user.type(email, 'alice@example.com');
    await user.type(password, 'Secret123');
    await user.dblClick(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
    expect(login).toHaveBeenCalledTimes(1);

    pending.resolve();
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('rejects a malformed email', async () => {
    const { user, email, password, submit } = setup();

    await user.type(email, 'not-an-email');
    await user.type(password, 'whatever');
    await submit();

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in with the entered credentials and redirects home, replacing the sign-in entry', async () => {
    login.mockResolvedValue(undefined);
    const { user, email, password, submit } = setup();

    await user.type(email, 'alice@example.com');
    await user.type(password, 'Secret123');
    await submit();

    expect(login).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'Secret123' });
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('returns to the page that asked the user to sign in', async () => {
    login.mockResolvedValue(undefined);
    const { user, email, password, submit } = setup('/polls/create');

    await user.type(email, 'alice@example.com');
    await user.type(password, 'Secret123');
    await submit();

    expect(replace).toHaveBeenCalledExactlyOnceWith('/polls/create');
  });

  it('shows the server’s message on failure and stays on the page', async () => {
    login.mockRejectedValue(apiError(401, 'Invalid email or password'));
    const { user, email, password, submit } = setup();

    await user.type(email, 'alice@example.com');
    await user.type(password, 'wrong');
    await submit();

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
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
