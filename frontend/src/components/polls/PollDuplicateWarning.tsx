import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DuplicatePollMatch } from '@/lib/api/ai';

interface PollDuplicateWarningProps {
  matches: DuplicatePollMatch[];
  onEdit: () => void;
  onContinue: () => void;
  isSubmitting: boolean;
}

export function PollDuplicateWarning({ matches, onEdit, onContinue, isSubmitting }: PollDuplicateWarningProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 flex-none text-amber-500" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-amber-900">This looks similar to an existing poll</p>
          <p className="text-sm text-amber-700">
            Review the poll{matches.length > 1 ? 's' : ''} below before creating a new one.
          </p>
        </div>
      </div>

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

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onEdit}>
          Edit my poll
        </Button>
        <Button type="button" variant="primary" onClick={onContinue} disabled={isSubmitting}>
          {isSubmitting ? 'Creating poll…' : 'Create anyway'}
        </Button>
      </div>
    </div>
  );
}
