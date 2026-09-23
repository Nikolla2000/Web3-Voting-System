'use client';

import type { Poll } from '@/types/poll';
import { getPollStatus } from '@/lib/polls/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import { useVotedTransactionHash } from '@/lib/voting/voted-storage';
import { PollVoteClosedNotice } from '@/components/polls/PollVoteClosedNotice';
import { PollVoteSignInPrompt } from '@/components/polls/PollVoteSignInPrompt';
import { PollVoteSuccess } from '@/components/polls/PollVoteSuccess';
import { PollVoteForm } from '@/components/polls/PollVoteForm';

interface PollVoteCardProps {
  poll: Poll;
}

export function PollVoteCard({ poll }: PollVoteCardProps) {
  const status = getPollStatus(poll);
  const authStatus = useAuthStore((state) => state.status);
  const votedTx = useVotedTransactionHash(poll.id);

  if (status !== 'active') {
    return <PollVoteClosedNotice status={status} />;
  }

  if (authStatus === 'idle' || authStatus === 'loading') {
    return null;
  }

  if (authStatus !== 'authenticated') {
    return <PollVoteSignInPrompt />;
  }

  if (votedTx) {
    return <PollVoteSuccess transactionHash={votedTx} />;
  }

  return <PollVoteForm poll={poll} />;
}
