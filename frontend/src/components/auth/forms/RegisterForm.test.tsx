import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { RegisterForm } from '@/components/auth/forms/RegisterForm';
import { useAuthStore } from '@/lib/store/auth-store';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const register = vi.fn();

function setup() {
  const user = userEvent.setup();
  render(<RegisterForm />);
  const fill = async (values: { username: string; email: string; password: string; confirm: string }) => {
    await user.type(screen.getByLabelText('Username'), values.username);
    await user.type(screen.getByLabelText('Email'), values.email);
    await user.type(screen.getByLabelText('Password'), values.password);
    await user.type(screen.getByLabelText('Confirm password'), values.confirm);
  };
  const submit = () => user.click(screen.getByRole('button', { name: /create account/i }));
  return { fill, submit };
}

const valid = { username: 'alice_01', email: 'alice@example.com', password: 'Secret123', confirm: 'Secret123' };

beforeEach(() => {
  useAuthStore.setState({ register });
});

describe('RegisterForm', () => {
  it('shows each field’s validation error and does not register', async () => {
    const { fill, submit } = setup();

    await fill({ username: 'a b', email: 'nope', password: 'weakpass', confirm: 'different' });
    await submit();

    expect(
      await screen.findByText('Username can only contain letters, numbers and underscores'),
    ).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(
      screen.getByText('Password must contain at least one uppercase letter, one lowercase letter and one number'),
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('flags mismatched passwords on the confirmation field', async () => {
    const { fill, submit } = setup();

    await fill({ ...valid, confirm: 'Secret124' });
    await submit();

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('registers without sending confirmPassword, then goes to the polls page', async () => {
    register.mockResolvedValue(undefined);
    const { fill, submit } = setup();

    await fill(valid);
    await submit();

    expect(register).toHaveBeenCalledWith({ username: 'alice_01', email: 'alice@example.com', password: 'Secret123' });
    expect(push).toHaveBeenCalledWith('/polls');
  });

  it('shows the server’s message when registration is rejected', async () => {
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
    register.mockRejectedValue(
      new AxiosError('conflict', 'ERR_BAD_REQUEST', config, null, {
        status: 409,
        statusText: '',
        data: { message: 'Email already in use' },
        headers: {},
        config,
      }),
    );
    const { fill, submit } = setup();

    await fill(valid);
    await submit();

    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
