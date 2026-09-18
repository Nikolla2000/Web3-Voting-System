'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/lib/store/auth-store';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const status = useAuthStore(useShallow((state) => state.status));

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in');
    }
  }, [status, router]);

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-1/3 animate-pulse rounded bg-slate-100" />
      <div className="h-64 animate-pulse rounded-3xl border border-indigo-100/70 bg-white/80" />
    </div>
  );
}
