import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authHref } from '@/lib/auth/return-to';

interface PollVoteSignInPromptProps {
  pollId: string;
}

export function PollVoteSignInPrompt({ pollId }: PollVoteSignInPromptProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl border border-indigo-100/70 bg-white/80 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-start gap-3 text-sm text-slate-600">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
        <p>Sign in to cast an anonymous, zero-knowledge vote on this poll.</p>
      </div>
      {/* Back to this poll afterwards, ready to vote. */}
      <Button href={authHref('/sign-in', `/polls/${pollId}`)} variant="primary" className="shrink-0">
        Sign in to vote
      </Button>
    </div>
  );
}
