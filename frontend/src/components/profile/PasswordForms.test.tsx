import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { SetPasswordForm } from '@/components/profile/SetPasswordForm';
import { changePassword } from '@/lib/api/users';
import { apiError } from '@/test/axios-adapter';
import { renderWithQuery } from '@/test/render';

vi.mock('@/lib/api/users', () => ({ changePassword: vi.fn() }));

describe('ChangePasswordForm', () => {
  function setup() {
    const utils = renderWithQuery(<ChangePasswordForm />);
    const current = screen.getByLabelText('Current password');
    const next = screen.getByLabelText('New password');
    const confirm = screen.getByLabelText('Confirm new password');
    const fill = async (values: { current?: string; next?: string; confirm?: string } = {}) => {
      await utils.user.type(current, values.current ?? 'OldPass1');
      await utils.user.type(next, values.next ?? 'NewPass123');
      await utils.user.type(confirm, values.confirm ?? values.next ?? 'NewPass123');
    };
    const submit = () => utils.user.click(screen.getByRole('button', { name: 'Update password' }));
    return { ...utils, current, next, confirm, fill, submit };
  }

  it('requires every field when submitted empty', async () => {
    const { current, next, confirm, submit } = setup();

    await submit();

    await vi.waitFor(() => expect(current).toHaveAccessibleDescription('Current password is required'));
    expect(next).toBeInvalid();
    expect(confirm).toHaveAccessibleDescription('Please confirm your new password');
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('rejects a mismatched confirmation', async () => {
    const { confirm, fill, submit } = setup();

    await fill({ confirm: 'NewPass124' });
    await submit();

    await vi.waitFor(() => expect(confirm).toHaveAccessibleDescription('Passwords do not match'));
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('sends the current and new password, never the confirmation, then confirms and clears the form', async () => {
    vi.mocked(changePassword).mockResolvedValue();
    const { current, next, confirm, fill, submit } = setup();

    await fill();
    await submit();

    expect(await screen.findByText('Password updated.')).toBeInTheDocument();
    expect(vi.mocked(changePassword).mock.calls[0]![0]).toEqual({
      currentPassword: 'OldPass1',
      newPassword: 'NewPass123',
    });
    for (const field of [current, next, confirm]) expect(field).toHaveValue('');
  });

  it('shows a wrong-current-password error from the server and keeps what was typed', async () => {
    vi.mocked(changePassword).mockRejectedValue(apiError(401, 'Current password is incorrect'));
    const { next, fill, submit } = setup();

    await fill();
    await submit();

    expect(await screen.findByText('Current password is incorrect')).toBeInTheDocument();
    expect(screen.queryByText('Password updated.')).not.toBeInTheDocument();
    expect(next).toHaveValue('NewPass123');
  });

  it('replaces an earlier success message with the error from a later attempt', async () => {
    vi.mocked(changePassword).mockResolvedValueOnce().mockRejectedValueOnce(apiError(400, 'Password was used recently'));
    const { fill, submit } = setup();

    await fill();
    await submit();
    await screen.findByText('Password updated.');

    await fill({ current: 'NewPass123', next: 'OldPass1' });
    await submit();

    expect(await screen.findByText('Password was used recently')).toBeInTheDocument();
    expect(screen.queryByText('Password updated.')).not.toBeInTheDocument();
  });
});

describe('SetPasswordForm (Google-only accounts)', () => {
  function setup() {
    const utils = renderWithQuery(<SetPasswordForm />);
    const submit = () => utils.user.click(screen.getByRole('button', { name: 'Set password' }));
    return { ...utils, submit };
  }

  it('asks for no current password, and sends only the new one', async () => {
    vi.mocked(changePassword).mockResolvedValue();
    const { user, submit } = setup();

    expect(screen.queryByLabelText('Current password')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('New password'), 'NewPass123');
    await user.type(screen.getByLabelText('Confirm new password'), 'NewPass123');
    await submit();

    expect(await screen.findByText(/Password set\. You can now sign in/)).toBeInTheDocument();
    expect(vi.mocked(changePassword).mock.calls[0]![0]).toEqual({ newPassword: 'NewPass123' });
  });

  it('enforces the password strength rules', async () => {
    const { user, submit } = setup();

    await user.type(screen.getByLabelText('New password'), 'alllowercase');
    await user.type(screen.getByLabelText('Confirm new password'), 'alllowercase');
    await submit();

    await vi.waitFor(() =>
      expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
        'Password must contain at least one uppercase letter, one lowercase letter and one number',
      ),
    );
    expect(changePassword).not.toHaveBeenCalled();
  });
});
