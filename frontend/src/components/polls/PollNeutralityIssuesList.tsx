import type { NeutralityIssue } from '@/lib/api/ai';

interface PollNeutralityIssuesListProps {
  issues: NeutralityIssue[];
}

export function PollNeutralityIssuesList({ issues }: PollNeutralityIssuesListProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-amber-900">
        This poll's wording may not be neutral
      </p>
      <ul className="flex flex-col gap-2">
        {issues.map((issue) => (
          <li key={issue.text} className="rounded-xl border border-amber-200 bg-white/70 px-4 py-2.5 text-sm">
            <p className="text-slate-700">“{issue.text}”</p>
            <p className="mt-1 text-amber-700">{issue.explanation}</p>
            <p className="mt-1 text-slate-500">
              Suggestion: <span className="text-slate-700">{issue.suggestion}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
