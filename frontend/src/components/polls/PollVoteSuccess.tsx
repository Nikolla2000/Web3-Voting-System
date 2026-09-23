import { CheckCircle2, ExternalLink } from 'lucide-react';

interface PollVoteSuccessProps {
  transactionHash: string;
}

export function PollVoteSuccess({ transactionHash }: PollVoteSuccessProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 text-sm text-emerald-800 sm:p-8">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Your vote was submitted anonymously. It&apos;ll be reflected in the results below once the transaction
          confirms on-chain.
        </p>
      </div>
      <a
        href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 font-mono text-xs text-emerald-700 hover:underline"
      >
        View transaction
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
