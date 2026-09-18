import type { Poll } from '@/types/poll';
import { POLL_CATEGORY_LABELS, formatDeadline, formatStartCountdown, getPollStatus } from '@/lib/polls/utils';
import { PollStatusBadge } from '@/components/polls/PollStatusBadge';

interface PollDetailHeroProps {
  poll: Poll;
}

export function PollDetailHero({ poll }: PollDetailHeroProps) {
  const status = getPollStatus(poll);
  const deadlineLabel = status === 'upcoming' ? formatStartCountdown(poll.startsAt) : formatDeadline(poll.endsAt, status);

  return (
    <div className="overflow-hidden rounded-3xl border border-indigo-100/70 bg-white/80 backdrop-blur-sm">
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        <img src={poll.imageUrl} alt={poll.title} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <PollStatusBadge status={status} />
          <span className="rounded-full bg-white/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-indigo-600 backdrop-blur-sm">
            {POLL_CATEGORY_LABELS[poll.category]}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold leading-snug text-slate-900 sm:text-3xl">
          {poll.title}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500 sm:text-base">{poll.description}</p>
        <span className="text-xs font-medium text-slate-400">{deadlineLabel}</span>
      </div>
    </div>
  );
}
