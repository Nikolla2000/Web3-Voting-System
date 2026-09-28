'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validation/profile-schemas';
import { changePassword } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/errors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function ChangePasswordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setSuccessMessage('Password updated.');
      reset();
    },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    setSubmitError(null);
    setSuccessMessage(null);

    mutation.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onError: (error) => setSubmitError(getApiErrorMessage(error)) },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Input
        label="Current password"
        type="password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <Input label="New password" type="password" error={errors.newPassword?.message} {...register('newPassword')} />
      <Input
        label="Confirm new password"
        type="password"
        error={errors.confirmNewPassword?.message}
        {...register('confirmNewPassword')}
      />

      {submitError && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{submitError}</p>}
      {successMessage && !submitError && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{successMessage}</p>
      )}

      <Button type="submit" variant="primary" className="self-start cursor-pointer" disabled={mutation.isPending}>
        {mutation.isPending ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}
