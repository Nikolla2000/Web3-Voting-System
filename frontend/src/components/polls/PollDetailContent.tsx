import type { Poll } from '@/types/poll';
import { PollDetailBackLink } from '@/components/polls/PollDetailBackLink';
import { PollDetailHero } from '@/components/polls/PollDetailHero';
import { PollDetailOptions } from '@/components/polls/PollDetailOptions';
import { PollDetailMeta } from '@/components/polls/PollDetailMeta';
import { PollDetailVoteNotice } from '@/components/polls/PollDetailVoteNotice';

interface PollDetailContentProps {
  poll: Poll;
}

export function PollDetailContent({ poll }: PollDetailContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <PollDetailBackLink />
      <PollDetailHero poll={poll} />
      <PollDetailVoteNotice />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <PollDetailOptions options={poll.options} />
        <PollDetailMeta poll={poll} />
      </div>
    </div>
  );
}
