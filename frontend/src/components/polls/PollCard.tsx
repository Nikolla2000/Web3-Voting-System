import Link from 'next/link';
import { ArrowUpRight, Clock, Users } from 'lucide-react';
import type { Poll } from '@/types/poll';
import {
  POLL_CATEGORY_LABELS,
  formatDeadline,
  formatStartCountdown,
  formatVoteCount,
  getLeadingOptionId,
  getPollStatus,
  getTotalVotes,
} from '@/lib/polls/utils';
import { PollStatusBadge } from '@/components/polls/PollStatusBadge';
import { PollOptionBar } from '@/components/polls/PollOptionBar';

const MAX_VISIBLE_OPTIONS = 4;

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const status = getPollStatus(poll);
  const totalVotes = getTotalVotes(poll.options);
  const leadingOptionId = getLeadingOptionId(poll.options);
  const visibleOptions = poll.options.slice(0, MAX_VISIBLE_OPTIONS);
  const hiddenOptionsCount = poll.options.length - visibleOptions.length;

  const deadlineLabel =
    status === 'upcoming' ? formatStartCountdown(poll.startsAt) : formatDeadline(poll.endsAt, status);

  return (
    <Link
      href={`/polls/${poll.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_40px_-20px_rgba(79,70,229,0.35)]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={poll.imageUrl}
          alt={poll.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <PollStatusBadge status={status} />
          <span className="rounded-full bg-white/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-indigo-600 backdrop-blur-sm">
            {POLL_CATEGORY_LABELS[poll.category]}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold leading-snug text-slate-900">{poll.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{poll.description}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {visibleOptions.map((option) => (
            <PollOptionBar
              key={option.id}
              option={option}
              totalVotes={totalVotes}
              isLeading={totalVotes > 0 && option.id === leadingOptionId}
            />
          ))}
          {hiddenOptionsCount > 0 && (
            <span className="text-xs font-medium text-slate-400">+{hiddenOptionsCount} more options</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {formatVoteCount(totalVotes)} votes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {deadlineLabel}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-indigo-600 transition-transform group-hover:translate-x-0.5">
            View
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}