import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { RegisterForm } from '@/components/auth/forms/RegisterForm';
import { useAuthStore } from '@/lib/store/auth-store';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const register = vi.fn();

function setup(returnTo?: string | null) {
  const user = userEvent.setup();
  render(<RegisterForm returnTo={returnTo} />);
  const fill = async (values: {
    username: string;
    email: string;
    password: string;
    confirm: string;
  }) => {
    await user.type(screen.getByLabelText('Username'), values.username);
    await user.type(screen.getByLabelText('Email'), values.email);
    await user.type(screen.getByLabelText('Password'), values.password);
    await user.type(screen.getByLabelText('Confirm password'), values.confirm);
  };
  const submit = () => user.click(screen.getByRole('button', { name: /create account/i }));
  return { fill, submit };
}

const valid = {
  username: 'alice_01',
  email: 'alice@example.com',
  password: 'Secret123',
  confirm: 'Secret123',
};

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
      screen.getByText(
        'Password must contain at least one uppercase letter, one lowercase letter and one number',
      ),
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

    expect(register).toHaveBeenCalledWith({
      username: 'alice_01',
      email: 'alice@example.com',
      password: 'Secret123',
    });
    expect(replace).toHaveBeenCalledWith('/polls');
  });

  it('returns to the page that asked the user to sign in, instead of the polls page', async () => {
    register.mockResolvedValue(undefined);
    const { fill, submit } = setup('/polls/create');

    await fill(valid);
    await submit();

    expect(replace).toHaveBeenCalledExactlyOnceWith('/polls/create');
  });

  it('disables the button while the account is being created', async () => {
    let finish!: () => void;
    register.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    const { fill } = setup();

    await fill(valid);
    await userEvent.dblClick(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('button', { name: 'Creating account…' })).toBeDisabled();
    expect(register).toHaveBeenCalledTimes(1);
    finish();
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
    expect(replace).not.toHaveBeenCalled();
  });
});
