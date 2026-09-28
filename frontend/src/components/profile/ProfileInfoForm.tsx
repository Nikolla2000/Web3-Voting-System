'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRound } from 'lucide-react';
import { profileInfoSchema, type ProfileInfoFormValues } from '@/lib/validation/profile-schemas';
import { updateProfile } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/store/auth-store';
import type { UserProfile } from '@/types/user';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProfileAvatarPreview } from '@/components/profile/ProfileAvatarPreview';
import { SectionCard } from '@/components/profile/SectionCard';

interface ProfileInfoFormProps {
  profile: UserProfile;
}

export function ProfileInfoForm({ profile }: ProfileInfoFormProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInfoFormValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      username: profile.username,
      email: profile.email,
      avatar: profile.avatar ?? '',
    },
  });

  const watchedAvatar = watch('avatar');
  const watchedUsername = watch('username');

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      setSuccessMessage('Profile updated.');
      queryClient.setQueryData(['profile'], updated);
      reset({ username: updated.username, email: updated.email, avatar: updated.avatar ?? '' });
      useAuthStore.setState((state) =>
        state.user ? { user: { ...state.user, username: updated.username, email: updated.email } } : state,
      );
    },
  });

  const onSubmit = (values: ProfileInfoFormValues) => {
    setSubmitError(null);
    setSuccessMessage(null);

    mutation.mutate(
      { username: values.username, email: values.email, avatar: values.avatar },
      { onError: (error) => setSubmitError(getApiErrorMessage(error)) },
    );
  };

  return (
    <SectionCard eyebrow="Account" title="Account details" icon={UserRound}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <ProfileAvatarPreview key={watchedAvatar} avatarUrl={watchedAvatar || undefined} username={watchedUsername || profile.username} />
          <div className="flex-1">
            <Input
              label="Avatar URL"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              error={errors.avatar?.message}
              {...register('avatar')}
            />
          </div>
        </div>

        <Input label="Username" error={errors.username?.message} {...register('username')} />

        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />

        {submitError && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{submitError}</p>}
        {successMessage && !submitError && (
          <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{successMessage}</p>
        )}

        <Button type="submit" variant="primary" className="self-start cursor-pointer" disabled={mutation.isPending || !isDirty}>
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </SectionCard>
  );
}
