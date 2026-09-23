import { Clock, ShieldCheck } from 'lucide-react';
import type { PollStatus } from '@/types/poll';

type ClosedStatus = Exclude<PollStatus, 'active'>;

interface PollVoteClosedNoticeProps {
  status: ClosedStatus;
}

const COPY: Record<ClosedStatus, string> = {
  upcoming:
    'Voting opens once this poll starts. Anonymous, on-chain voting via Semaphore zero-knowledge proofs will be available here.',
  ended: 'Voting has closed for this poll. Results below reflect the final on-chain tally.',
};

export function PollVoteClosedNotice({ status }: PollVoteClosedNoticeProps) {
  const Icon = status === 'upcoming' ? Clock : ShieldCheck;

  return (
    <div className="flex items-start gap-3 rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/60 p-6 text-sm text-indigo-700 sm:p-8">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p>{COPY[status]}</p>
    </div>
  );
}
