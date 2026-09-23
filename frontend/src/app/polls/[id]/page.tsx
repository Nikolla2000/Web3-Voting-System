'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { HexGrid } from '@/components/home/HexGrid';
import { fetchPollById } from '@/lib/api/polls';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getPollStatus } from '@/lib/polls/utils';
import { PollDetailContent } from '@/components/polls/PollDetailContent';
import { PollDetailLoadingState } from '@/components/polls/PollDetailLoadingState';
import { PollDetailErrorState } from '@/components/polls/PollDetailErrorState';

interface PollDetailPageProps {
  params: Promise<{ id: string }>;
}

// A vote's tally only updates once its on-chain tx confirms and the
// blockchain service's chain listener republishes it — there's no
// websocket layer to push that update, so poll for it while votes could
// plausibly still be landing.
const ACTIVE_POLL_REFETCH_INTERVAL_MS = 15_000;

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const { id } = use(params);

  const { data: poll, isPending, isError, error, refetch } = useQuery({
    queryKey: ['poll', id],
    queryFn: () => fetchPollById(id),
    refetchInterval: (query) => {
      const currentPoll = query.state.data;
      return currentPoll && getPollStatus(currentPoll) === 'active' ? ACTIVE_POLL_REFETCH_INTERVAL_MS : false;
    },
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
