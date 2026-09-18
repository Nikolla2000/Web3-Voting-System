import { CalendarClock, ExternalLink, FileCode2 } from 'lucide-react';
import type { Poll } from '@/types/poll';
import { formatDateTime } from '@/lib/polls/utils';

interface PollDetailMetaProps {
  poll: Poll;
}

export function PollDetailMeta({ poll }: PollDetailMetaProps) {
  return (
    <div className="rounded-3xl border border-indigo-100/70 bg-white/80 p-6 backdrop-blur-sm sm:p-8">
      <h2 className="mb-5 font-display text-lg font-semibold text-slate-900">Details</h2>

      <dl className="flex flex-col gap-4 text-sm">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div>
            <dt className="text-xs text-slate-400">Opens</dt>
            <dd className="text-slate-700">{formatDateTime(poll.startsAt)}</dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div>
            <dt className="text-xs text-slate-400">Closes</dt>
            <dd className="text-slate-700">{formatDateTime(poll.endsAt)}</dd>
          </div>
        </div>

        {poll.contractAddress && (
          <div className="flex items-start gap-3">
            <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <div>
              <dt className="text-xs text-slate-400">Contract (Sepolia)</dt>
              <dd>
                <a
                  href={`https://sepolia.etherscan.io/address/${poll.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-indigo-600 hover:underline"
                >
                  {poll.contractAddress}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </dd>
            </div>
          </div>
        )}
      </dl>
    </div>
  );
}
