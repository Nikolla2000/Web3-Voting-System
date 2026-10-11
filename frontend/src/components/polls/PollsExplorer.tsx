'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PollSortOption, PollStatus } from '@/types/poll';
import { filterPolls, sortPolls } from '@/lib/polls/utils';
import { fetchPolls, fetchPollById } from '@/lib/api/polls';
import { searchPolls } from '@/lib/api/ai';
import { getApiErrorMessage } from '@/lib/api/errors';
import { PollsToolbar } from '@/components/polls/PollsToolbar';
import { PollsAiSearchBar } from '@/components/polls/PollsAiSearchBar';
import { PollsGrid } from '@/components/polls/PollsGrid';
import { PollsLoadingState } from '@/components/polls/PollsLoadingState';
import { PollsErrorState } from '@/components/polls/PollsErrorState';

const MAX_POLLS_PER_FETCH = 50;

export function PollsExplorer() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PollStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<PollSortOption>('newest');
  const [aiQuery, setAiQuery] = useState<string | null>(null);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['polls'],
    queryFn: () => fetchPolls({ limit: MAX_POLLS_PER_FETCH }),
    enabled: aiQuery === null,
  });

  const aiSearch = useQuery({
    queryKey: ['polls-ai-search', aiQuery],
    queryFn: async () => {
      const results = await searchPolls(aiQuery!);
      return Promise.all(results.map((result) => fetchPollById(result.pollId)));
    },
    enabled: aiQuery !== null,
  });

  const visiblePolls = useMemo(() => {
    const filtered = filterPolls(data?.items ?? [], { query, status });
    return sortPolls(filtered, sortBy);
  }, [data, query, status, sortBy]);

  const hasActiveFilters = query.trim().length > 0 || status !== 'all';

  return (
    <div className="flex flex-col gap-6">
      <PollsToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      <PollsAiSearchBar
        onSearch={setAiQuery}
        onClear={() => setAiQuery(null)}
        isSearching={aiSearch.isFetching}
        isActive={aiQuery !== null}
      />

      {aiQuery !== null ? (
        aiSearch.isPending ? (
          <PollsLoadingState />
        ) : aiSearch.isError ? (
          <PollsErrorState message={getApiErrorMessage(aiSearch.error)} onRetry={() => aiSearch.refetch()} />
        ) : (
          <PollsGrid polls={aiSearch.data} hasActiveFilters />
        )
      ) : isPending ? (
        <PollsLoadingState />
      ) : isError ? (
        <PollsErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <PollsGrid polls={visiblePolls} hasActiveFilters={hasActiveFilters} />
      )}
    </div>
  );
}
