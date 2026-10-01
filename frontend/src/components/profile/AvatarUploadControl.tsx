'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, X } from 'lucide-react';
import { confirmAvatar, deleteAvatar, requestAvatarUploadUrl, uploadAvatarFile } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/store/auth-store';
import { IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE_BYTES } from '@/lib/validation/image-upload';
import { ProfileAvatarPreview } from '@/components/profile/ProfileAvatarPreview';
import type { UserProfile } from '@/types/user';

interface AvatarUploadControlProps {
  avatarUrl?: string | null;
  username: string;
}

export function AvatarUploadControl({ avatarUrl, username }: AvatarUploadControlProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const syncAvatar = (updated: UserProfile) => {
    queryClient.setQueryData(['profile'], updated);
    useAuthStore.setState((state) => (state.user ? { user: { ...state.user, avatar: updated.avatar } } : state));
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const target = await requestAvatarUploadUrl({ contentType: file.type, size: file.size });
      await uploadAvatarFile(target.uploadUrl, file);
      return confirmAvatar(target.key);
    },
    onSuccess: syncAvatar,
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: syncAvatar,
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const isBusy = uploadMutation.isPending || removeMutation.isPending;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);

    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG or WEBP image.');
      return;
    }

    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      setError('Image must be under 5MB.');
      return;
    }

    uploadMutation.mutate(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-fit">
        <ProfileAvatarPreview avatarUrl={avatarUrl ?? undefined} username={username} size={80} className="ring-4 ring-white" />

        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          aria-label="Change avatar"
          className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:pointer-events-none disabled:opacity-60"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ALLOWED_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {avatarUrl && (
        <button
          type="button"
          onClick={() => removeMutation.mutate()}
          disabled={isBusy}
          className="inline-flex w-fit cursor-pointer items-center gap-1 text-xs text-slate-400 transition-colors hover:text-red-500 disabled:pointer-events-none disabled:opacity-60"
        >
          <X className="h-3 w-3" />
          Remove photo
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
