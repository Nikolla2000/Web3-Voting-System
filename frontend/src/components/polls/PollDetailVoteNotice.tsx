import { ShieldCheck } from 'lucide-react';

export function PollDetailVoteNotice() {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/60 p-6 text-sm text-indigo-700 sm:p-8">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
      <p>
        Anonymous, on-chain voting via Semaphore zero-knowledge proofs is coming soon. Once the voting
        contracts are live on Sepolia, you&apos;ll be able to cast your vote here with your wallet.
      </p>
    </div>
  );
}
