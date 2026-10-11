import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PollDuplicateMatchesList } from '@/components/polls/PollDuplicateMatchesList';
import { PollNeutralityIssuesList } from '@/components/polls/PollNeutralityIssuesList';
import type { DuplicatePollMatch, NeutralityIssue } from '@/lib/api/ai';

interface PollPreflightWarningsProps {
  duplicates: DuplicatePollMatch[];
  neutralityIssues: NeutralityIssue[];
  onEdit: () => void;
  onContinue: () => void;
  isSubmitting: boolean;
}

export function PollPreflightWarnings({
  duplicates,
  neutralityIssues,
  onEdit,
  onContinue,
  isSubmitting,
}: PollPreflightWarningsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 flex-none text-amber-500" />
        <p className="text-sm text-amber-700">Review this before creating your poll — you can still proceed as is.</p>
      </div>

      {duplicates.length > 0 && <PollDuplicateMatchesList matches={duplicates} />}
      {neutralityIssues.length > 0 && <PollNeutralityIssuesList issues={neutralityIssues} />}

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
