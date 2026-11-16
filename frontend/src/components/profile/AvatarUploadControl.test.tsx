import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { AvatarUploadControl } from '@/components/profile/AvatarUploadControl';
import { confirmAvatar, deleteAvatar, requestAvatarUploadUrl, uploadAvatarFile } from '@/lib/api/users';
import { useAuthStore } from '@/lib/store/auth-store';
import { IMAGE_MAX_SIZE_BYTES } from '@/lib/validation/image-upload';
import { apiError, deferred } from '@/test/axios-adapter';
import { profileFixture } from '@/test/fixtures';
import { renderWithQuery } from '@/test/render';

vi.mock('@/lib/api/users', () => ({
  requestAvatarUploadUrl: vi.fn(),
  uploadAvatarFile: vi.fn(),
  confirmAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
}));

const TARGET = { uploadUrl: 'https://r2.example/presigned', key: 'avatars/u1/abc.png', publicUrl: 'https://cdn/abc.png' };
const png = (size = 2048) => new File([new Uint8Array(size)], 'me.png', { type: 'image/png' });

function setup(avatarUrl: string | null = null) {
  const utils = renderWithQuery(<AvatarUploadControl avatarUrl={avatarUrl} username="alice" />);
  // The file input is hidden and unlabelled; "Change avatar" is the control users reach.
  const fileInput = utils.container.querySelector<HTMLInputElement>('input[type="file"]')!;
  const choose = (file: File) => utils.user.upload(fileInput, file);
  return { ...utils, fileInput, choose };
}

beforeEach(() => {
  useAuthStore.setState({
    user: { id: 'u1', username: 'alice', email: 'alice@example.com', avatar: null },
    status: 'authenticated',
  });
});

describe('AvatarUploadControl', () => {
  it('shows initials when there is no avatar, and offers no "Remove photo"', () => {
    setup();

    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove photo/i })).not.toBeInTheDocument();
  });

  it('uploads in three steps — presign, PUT to R2, confirm — then syncs the new avatar everywhere', async () => {
    const updated = profileFixture({ avatar: TARGET.publicUrl });
    vi.mocked(requestAvatarUploadUrl).mockResolvedValue(TARGET);
    vi.mocked(uploadAvatarFile).mockResolvedValue();
    vi.mocked(confirmAvatar).mockResolvedValue(updated);
    const { choose, queryClient } = setup();
    const file = png();

    await choose(file);

    await vi.waitFor(() => expect(confirmAvatar).toHaveBeenCalledWith(TARGET.key));
    expect(requestAvatarUploadUrl).toHaveBeenCalledWith({ contentType: 'image/png', size: 2048 });
    expect(uploadAvatarFile).toHaveBeenCalledWith(TARGET.uploadUrl, file);
    expect(queryClient.getQueryData(['profile'])).toEqual(updated);
    expect(useAuthStore.getState().user?.avatar).toBe(TARGET.publicUrl);
  });

  it.each([
    ['a non-image type', new File(['GIF89a'], 'a.gif', { type: 'image/gif' }), 'Please choose a JPG, PNG or WEBP image.'],
    ['a file over 5MB', png(IMAGE_MAX_SIZE_BYTES + 1), 'Image must be under 5MB.'],
  ])('rejects %s before any network call', async (_label, file, message) => {
    const { fileInput } = setup();

    // Bypass the accept filter, as a user picking "All files" in the OS dialog would.
    await uploadIgnoringAccept(fileInput, file);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(requestAvatarUploadUrl).not.toHaveBeenCalled();
  });

  it('does not confirm an upload that never reached R2, and says why', async () => {
    vi.mocked(requestAvatarUploadUrl).mockResolvedValue(TARGET);
    vi.mocked(uploadAvatarFile).mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));
    const { choose } = setup();

    await choose(png());

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(confirmAvatar).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user?.avatar).toBeNull();
  });

  it('disables both controls while an upload is in flight', async () => {
    const upload = deferred<never>();
    vi.mocked(requestAvatarUploadUrl).mockReturnValue(upload.promise);
    const { choose } = setup('https://cdn/old.png');

    await choose(png());

    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Change avatar' })).toBeDisabled());
    expect(screen.getByRole('button', { name: /remove photo/i })).toBeDisabled();
  });

  it('removes the photo and syncs the cleared avatar', async () => {
    useAuthStore.setState((s) => ({ user: s.user && { ...s.user, avatar: 'https://cdn/old.png' } }));
    const updated = profileFixture({ avatar: null });
    vi.mocked(deleteAvatar).mockResolvedValue(updated);
    const { user, queryClient } = setup('https://cdn/old.png');

    expect(screen.getByRole('img', { name: "alice's avatar" })).toHaveAttribute('src', 'https://cdn/old.png');
    await user.click(screen.getByRole('button', { name: /remove photo/i }));

    await vi.waitFor(() => expect(useAuthStore.getState().user?.avatar).toBeNull());
    expect(queryClient.getQueryData(['profile'])).toEqual(updated);
  });

  // Regression: removing the photo didn't clear an earlier error, so a successful removal still
  // showed e.g. "Image must be under 5MB." underneath.
  it('clears an earlier error when the photo is then removed successfully', async () => {
    vi.mocked(deleteAvatar).mockResolvedValue(profileFixture({ avatar: null }));
    const { user, fileInput } = setup('https://cdn/old.png');

    await uploadIgnoringAccept(fileInput, png(IMAGE_MAX_SIZE_BYTES + 1));
    await screen.findByText('Image must be under 5MB.');
    await user.click(screen.getByRole('button', { name: /remove photo/i }));

    await vi.waitFor(() => expect(deleteAvatar).toHaveBeenCalled());
    await vi.waitFor(() => expect(screen.queryByText('Image must be under 5MB.')).not.toBeInTheDocument());
  });

  it('shows the server’s message when removal fails', async () => {
    vi.mocked(deleteAvatar).mockRejectedValue(apiError(500, 'Could not delete avatar'));
    const { user } = setup('https://cdn/old.png');

    await user.click(screen.getByRole('button', { name: /remove photo/i }));

    expect(await screen.findByText('Could not delete avatar')).toBeInTheDocument();
  });
});

/** user.upload honours `accept` by default and silently drops a mismatched file. */
function uploadIgnoringAccept(input: HTMLInputElement, file: File) {
  return userEvent.setup({ applyAccept: false, delay: null }).upload(input, file);
}
