'use client';

import { useState } from 'react';
import type { Poll } from '@/types/poll';
import { useCastVote } from '@/lib/voting/use-cast-vote';
import { getApiErrorMessage } from '@/lib/api/errors';
import { PollVoteOptionPicker } from '@/components/polls/PollVoteOptionPicker';
import { PollVoteProgress } from '@/components/polls/PollVoteProgress';
import { PollVoteSuccess } from '@/components/polls/PollVoteSuccess';
import { Button } from '@/components/ui/Button';

interface PollVoteFormProps {
  poll: Poll;
}

export function PollVoteForm({ poll }: PollVoteFormProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const { castVote, isPending, isSuccess, isError, error, transactionHash, stepLabel } = useCastVote(poll.id);

  if (isSuccess && transactionHash) {
    return <PollVoteSuccess transactionHash={transactionHash} />;
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-indigo-100/70 bg-white/80 p-6 backdrop-blur-sm sm:p-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-slate-900">Cast your vote</h2>
        <p className="mt-1 text-xs text-slate-500">
          Your vote is anonymous — a zero-knowledge proof confirms you&apos;re eligible without revealing who you
          are.
        </p>
      </div>

      <PollVoteOptionPicker
        options={poll.options}
        selectedOptionId={selectedOptionId}
        onSelect={setSelectedOptionId}
        disabled={isPending}
      />

      {isPending && stepLabel && <PollVoteProgress label={stepLabel} />}

      {isError && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{getApiErrorMessage(error)}</p>}

      <Button
        type="button"
        variant="primary"
        className="w-full"
        disabled={!selectedOptionId || isPending}
        onClick={() => selectedOptionId && castVote(selectedOptionId)}
      >
        {isPending ? 'Casting vote…' : 'Cast vote'}
      </Button>
    </div>
  );
}
