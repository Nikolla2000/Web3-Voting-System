import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { DangerZoneSection } from '@/components/profile/DangerZoneSection';
import { deactivateAccount } from '@/lib/api/users';
import { useAuthStore } from '@/lib/store/auth-store';
import { DEACTIVATE_CONFIRMATION_PHRASE } from '@/lib/validation/profile-schemas';
import { apiError, deferred } from '@/test/axios-adapter';
import { renderWithQuery } from '@/test/render';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/lib/api/users', () => ({ deactivateAccount: vi.fn() }));

const PHRASE_LABEL = `Type "${DEACTIVATE_CONFIRMATION_PHRASE}" to confirm`;

async function openDialog(hasPassword = true) {
  const utils = renderWithQuery(<DangerZoneSection hasPassword={hasPassword} />);
  await utils.user.click(screen.getByRole('button', { name: 'Deactivate account' }));
  const dialog = await screen.findByRole('alertdialog', { name: 'Deactivate your account?' });
  const confirm = () =>
    utils.user.click(within(dialog).getByRole('button', { name: 'Deactivate account' }));
  return { ...utils, dialog, confirm };
}

beforeEach(() => {
  useAuthStore.setState({
    user: { id: 'u1', username: 'alice', email: 'alice@example.com', avatar: null },
    accessToken: 'access-1',
    status: 'authenticated',
  });
});

describe('DangerZoneSection', () => {
  it('does nothing until the dialog is opened', () => {
    renderWithQuery(<DangerZoneSection hasPassword />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(deactivateAccount).not.toHaveBeenCalled();
  });

  it('requires the password and the exact phrase before sending anything', async () => {
    const { user, dialog, confirm } = await openDialog();

    await user.type(within(dialog).getByLabelText(PHRASE_LABEL), 'deactivate my account'); // wrong case
    await confirm();

    const password = within(dialog).getByLabelText('Password');
    await vi.waitFor(() => expect(password).toHaveAccessibleDescription('Password is required'));
    expect(within(dialog).getByLabelText(PHRASE_LABEL)).toHaveAccessibleDescription(
      `Type "${DEACTIVATE_CONFIRMATION_PHRASE}" exactly to continue`,
    );
    expect(deactivateAccount).not.toHaveBeenCalled();
  });

  it('deactivates with the password, signs out locally, and goes to sign-in', async () => {
    vi.mocked(deactivateAccount).mockResolvedValue();
    const { user, dialog, confirm } = await openDialog();

    await user.type(within(dialog).getByLabelText('Password'), 'Secret123');
    await user.type(within(dialog).getByLabelText(PHRASE_LABEL), DEACTIVATE_CONFIRMATION_PHRASE);
    await confirm();

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/sign-in'));
    expect(vi.mocked(deactivateAccount).mock.calls[0]![0]).toEqual({ password: 'Secret123' });
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
    });
  });

  it('for a Google-only account, asks for no password and sends none', async () => {
    vi.mocked(deactivateAccount).mockResolvedValue();
    const { user, dialog, confirm } = await openDialog(false);

    expect(within(dialog).queryByLabelText('Password')).not.toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(PHRASE_LABEL), DEACTIVATE_CONFIRMATION_PHRASE);
    await confirm();

    await vi.waitFor(() => expect(deactivateAccount).toHaveBeenCalled());
    expect(vi.mocked(deactivateAccount).mock.calls[0]![0]).toEqual({ password: undefined });
  });

  it('keeps the dialog open with the server’s message when the password is wrong', async () => {
    vi.mocked(deactivateAccount).mockRejectedValue(apiError(401, 'Incorrect password'));
    const { user, dialog, confirm } = await openDialog();

    await user.type(within(dialog).getByLabelText('Password'), 'Wrong123');
    await user.type(within(dialog).getByLabelText(PHRASE_LABEL), DEACTIVATE_CONFIRMATION_PHRASE);
    await confirm();

    expect(await within(dialog).findByText('Incorrect password')).toBeInTheDocument();
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(replace).not.toHaveBeenCalled();
  });

  it('locks both buttons while the request is in flight', async () => {
    vi.mocked(deactivateAccount).mockReturnValue(deferred<never>().promise);
    const { user, dialog, confirm } = await openDialog(false);

    await user.type(within(dialog).getByLabelText(PHRASE_LABEL), DEACTIVATE_CONFIRMATION_PHRASE);
    await confirm();

    expect(await within(dialog).findByRole('button', { name: 'Deactivating…' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('cancelling discards what was typed and any error, so reopening starts clean', async () => {
    vi.mocked(deactivateAccount).mockRejectedValue(apiError(401, 'Incorrect password'));
    const { user, dialog, confirm } = await openDialog();

    await user.type(within(dialog).getByLabelText('Password'), 'Wrong123');
    await user.type(within(dialog).getByLabelText(PHRASE_LABEL), DEACTIVATE_CONFIRMATION_PHRASE);
    await confirm();
    await within(dialog).findByText('Incorrect password');

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await vi.waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Deactivate account' }));
    const reopened = await screen.findByRole('alertdialog');
    expect(within(reopened).getByLabelText('Password')).toHaveValue('');
    expect(within(reopened).getByLabelText(PHRASE_LABEL)).toHaveValue('');
    expect(within(reopened).queryByText('Incorrect password')).not.toBeInTheDocument();
  });
});
