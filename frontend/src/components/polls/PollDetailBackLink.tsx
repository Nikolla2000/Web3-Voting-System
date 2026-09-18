import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function PollDetailBackLink() {
  return (
    <Link
      href="/polls"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to polls
    </Link>
  );
}
