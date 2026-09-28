'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { logoutAllRequest } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/store/auth-store';
import { SectionCard } from '@/components/profile/SectionCard';

export function SignOutEverywhereCard() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: logoutAllRequest,
    onSuccess: () => {
      useAuthStore.setState({ user: null, accessToken: null, status: 'unauthenticated' });
      router.replace('/sign-in');
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <SectionCard
      eyebrow="Security"
      title="Active sessions"
      description="Sign out of every device where you're currently logged in, including this one."
      icon={LogOut}
    >
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 disabled:pointer-events-none disabled:opacity-60"
      >
        {mutation.isPending ? 'Signing out…' : 'Sign out everywhere'}
      </button>
    </SectionCard>
  );
}
