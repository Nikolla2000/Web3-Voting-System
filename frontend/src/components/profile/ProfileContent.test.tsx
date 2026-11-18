import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { profileFixture } from '@/test/fixtures';
import { renderWithQuery } from '@/test/render';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
// Rendering only: no section is submitted here, so the API just has to exist.
vi.mock('@/lib/api/users', () => ({
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  deactivateAccount: vi.fn(),
  requestAvatarUploadUrl: vi.fn(),
  uploadAvatarFile: vi.fn(),
  confirmAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
}));

describe('ProfileContent', () => {
  it('shows the header and the account section first', () => {
    renderWithQuery(<ProfileContent profile={profileFixture({ role: 'ADMIN' })} />);

    expect(screen.getByRole('heading', { level: 1, name: 'alice' })).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Since January 15, 2026')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toHaveValue('alice');
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });

  it('switches sections from the nav', async () => {
    const { user } = renderWithQuery(<ProfileContent profile={profileFixture()} />);

    await user.click(screen.getByRole('button', { name: 'Security' }));
    expect(screen.getByLabelText('Current password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out everywhere' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Danger zone' }));
    expect(screen.getByRole('button', { name: 'Deactivate account' })).toBeInTheDocument();
  });

  it('offers "Set a password" instead of "change" to a Google-only account', async () => {
    const { user } = renderWithQuery(
      <ProfileContent profile={profileFixture({ hasPassword: false })} />,
    );

    await user.click(screen.getByRole('button', { name: 'Security' }));

    expect(screen.getByRole('heading', { name: 'Set a password' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Current password')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set password' })).toBeInTheDocument();
  });
});
