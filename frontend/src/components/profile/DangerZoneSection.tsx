'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { useMutation } from '@tanstack/react-query';
import { TriangleAlert } from 'lucide-react';
import {
  DEACTIVATE_CONFIRMATION_PHRASE,
  createDeactivateAccountSchema,
  type DeactivateAccountFormValues,
} from '@/lib/validation/profile-schemas';
import { deactivateAccount } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/store/auth-store';
import { Input } from '@/components/ui/Input';
import { SectionCard } from '@/components/profile/SectionCard';

const triggerButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-6 py-3 text-sm font-medium text-red-600 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 cursor-pointer';

const cancelButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:pointer-events-none disabled:opacity-60';

const confirmButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:pointer-events-none disabled:opacity-60 cursor-pointer';

interface DangerZoneSectionProps {
  hasPassword: boolean;
}

export function DangerZoneSection({ hasPassword }: DangerZoneSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => createDeactivateAccountSchema(hasPassword), [hasPassword]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeactivateAccountFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmText: '' },
  });

  const mutation = useMutation({
    mutationFn: deactivateAccount,
    onSuccess: () => {
      setOpen(false);
      useAuthStore.setState({ user: null, accessToken: null, status: 'unauthenticated' });
      router.replace('/sign-in');
    },
    onError: (err) => setSubmitError(getApiErrorMessage(err)),
  });

  const onSubmit = (values: DeactivateAccountFormValues) => {
    setSubmitError(null);
    mutation.mutate({ password: values.password || undefined });
  };

  return (
    <SectionCard
      eyebrow="Danger zone"
      title="Deactivate account"
      description="This immediately signs you out on every device and disables sign-in until an administrator reactivates you."
      icon={TriangleAlert}
      tone="danger"
    >
      <AlertDialog.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setSubmitError(null);
            reset();
          }
        }}
      >
        <AlertDialog.Trigger className={triggerButtonClasses}>Deactivate account</AlertDialog.Trigger>

        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-red-100 bg-white p-6 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.25)] transition-all data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:p-7">
            <AlertDialog.Title className="font-display text-lg font-semibold text-slate-900">
              Deactivate your account?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-slate-500">
              You&apos;ll be signed out immediately everywhere. Confirm below to continue.
            </AlertDialog.Description>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex flex-col gap-4">
              {hasPassword && (
                <Input
                  label="Password"
                  type="password"
                  error={errors.password?.message}
                  {...register('password')}
                />
              )}

              <Input
                label={`Type "${DEACTIVATE_CONFIRMATION_PHRASE}" to confirm`}
                placeholder={DEACTIVATE_CONFIRMATION_PHRASE}
                autoComplete="off"
                error={errors.confirmText?.message}
                {...register('confirmText')}
              />

              {submitError && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{submitError}</p>}

              <div className="mt-2 flex justify-end gap-3">
                <AlertDialog.Close type="button" className={cancelButtonClasses} disabled={mutation.isPending}>
                  Cancel
                </AlertDialog.Close>
                <button type="submit" className={confirmButtonClasses} disabled={mutation.isPending}>
                  {mutation.isPending ? 'Deactivating…' : 'Deactivate account'}
                </button>
              </div>
            </form>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </SectionCard>
  );
}
