import Link from 'next/link';
import type { DuplicatePollMatch } from '@/lib/api/ai';

interface PollDuplicateMatchesListProps {
  matches: DuplicatePollMatch[];
}

export function PollDuplicateMatchesList({ matches }: PollDuplicateMatchesListProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-amber-900">
        This looks similar to an existing poll{matches.length > 1 ? 's' : ''}
      </p>
      <ul className="flex flex-col gap-2">
        {matches.map((match) => (
          <li key={match.pollId}>
            <Link
              href={`/polls/${match.pollId}`}
              target="_blank"
              className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:border-amber-300"
            >
              <span className="truncate">{match.title}</span>
              <span className="flex-none text-xs font-medium text-amber-600">
                {Math.round(match.similarity * 100)}% similar
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
