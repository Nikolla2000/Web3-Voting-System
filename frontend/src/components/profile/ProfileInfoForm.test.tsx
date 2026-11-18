import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ProfileInfoForm } from '@/components/profile/ProfileInfoForm';
import { updateProfile } from '@/lib/api/users';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiError, deferred } from '@/test/axios-adapter';
import { profileFixture } from '@/test/fixtures';
import { renderWithQuery } from '@/test/render';

vi.mock('@/lib/api/users', () => ({ updateProfile: vi.fn() }));

const profile = profileFixture();

function setup() {
  const utils = renderWithQuery(<ProfileInfoForm profile={profile} />);
  const username = screen.getByLabelText('Username');
  const email = screen.getByLabelText('Email');
  const save = screen.getByRole('button', { name: 'Save changes' });
  return { ...utils, username, email, save };
}

beforeEach(() => {
  useAuthStore.setState({
    user: { id: 'u1', username: 'alice', email: 'alice@example.com', avatar: null },
    status: 'authenticated',
  });
});

describe('ProfileInfoForm', () => {
  it('starts with the current details and nothing to save', () => {
    const { username, email, save } = setup();

    expect(username).toHaveValue('alice');
    expect(email).toHaveValue('alice@example.com');
    expect(save).toBeDisabled();
  });

  it('enables saving once a field changes', async () => {
    const { user, username, save } = setup();

    await user.type(username, '_2');

    expect(save).toBeEnabled();
  });

  it('shows validation errors on the fields and sends nothing', async () => {
    const { user, username, email, save } = setup();

    await user.clear(username);
    await user.type(username, 'a!');
    await user.clear(email);
    await user.type(email, 'not-an-email');
    await user.click(save);

    await vi.waitFor(() => expect(username).toBeInvalid());
    expect(username).toHaveAccessibleDescription('Username must be at least 3 characters');
    expect(email).toHaveAccessibleDescription('Enter a valid email address');
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('saves, confirms, and syncs the new details into the profile cache and the navbar user', async () => {
    const updated = profileFixture({ username: 'alice_2', email: 'alice2@example.com' });
    vi.mocked(updateProfile).mockResolvedValue(updated);
    const { user, queryClient, username, email, save } = setup();

    await user.type(username, '_2');
    await user.clear(email);
    await user.type(email, 'alice2@example.com');
    await user.click(save);

    expect(await screen.findByText('Profile updated.')).toBeInTheDocument();
    expect(vi.mocked(updateProfile).mock.calls[0]![0]).toEqual({
      username: 'alice_2',
      email: 'alice2@example.com',
    });
    expect(queryClient.getQueryData(['profile'])).toEqual(updated);
    expect(useAuthStore.getState().user).toMatchObject({
      username: 'alice_2',
      email: 'alice2@example.com',
    });
    // The saved values become the new baseline, so there is nothing left to save.
    expect(save).toBeDisabled();
  });

  it('shows the server’s message, e.g. a taken username, and keeps the edits', async () => {
    vi.mocked(updateProfile).mockRejectedValue(apiError(409, 'Username is already taken'));
    const { user, username, save } = setup();

    await user.type(username, '_2');
    await user.click(save);

    expect(await screen.findByText('Username is already taken')).toBeInTheDocument();
    expect(username).toHaveValue('alice_2');
    expect(useAuthStore.getState().user?.username).toBe('alice');
  });

  it('locks the button while saving', async () => {
    const pending = deferred<never>();
    vi.mocked(updateProfile).mockReturnValue(pending.promise);
    const { user, username, save } = setup();

    await user.type(username, '_2');
    await user.click(save);

    expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});
