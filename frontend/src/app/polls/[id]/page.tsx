'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { HexGrid } from '@/components/home/HexGrid';
import { fetchPollById } from '@/lib/api/polls';
import { getApiErrorMessage } from '@/lib/api/errors';
import { PollDetailContent } from '@/components/polls/PollDetailContent';
import { PollDetailLoadingState } from '@/components/polls/PollDetailLoadingState';
import { PollDetailErrorState } from '@/components/polls/PollDetailErrorState';

interface PollDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const { id } = use(params);

  const { data: poll, isPending, isError, error, refetch } = useQuery({
    queryKey: ['poll', id],
    queryFn: () => fetchPollById(id),
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f8f9ff] to-[#f2f3fd]">
      <HexGrid />
      <Navbar />

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-10 lg:pt-8">
        {isPending ? (
          <PollDetailLoadingState />
        ) : isError ? (
          <PollDetailErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />
        ) : (
          <PollDetailContent poll={poll} />
        )}
      </section>
    </main>
  );
}
