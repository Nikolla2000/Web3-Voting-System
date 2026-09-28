'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { HexGrid } from '@/components/home/HexGrid';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { fetchProfile } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ProfileLoadingState } from '@/components/profile/ProfileLoadingState';
import { ProfileErrorState } from '@/components/profile/ProfileErrorState';

function ProfilePageBody() {
  const {
    data: profile,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  if (isPending) return <ProfileLoadingState />;
  if (isError) return <ProfileErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />;

  return <ProfileContent profile={profile} />;
}

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f8f9ff] to-[#f2f3fd]">
      <HexGrid />
      <Navbar />

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-10 lg:pt-8">
        <RequireAuth>
          <ProfilePageBody />
        </RequireAuth>
      </section>
    </main>
  );
}
