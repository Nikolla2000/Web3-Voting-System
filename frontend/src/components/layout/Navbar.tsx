import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  return (
    <header className="relative z-20 w-full">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-static.png" alt="VoteChain logo" width={40} height={30} priority />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            VoteChain
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/polls"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            Polls
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            How it works
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button href="/sign-in" variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button href="/register" variant="primary" className="!px-5 !py-2.5 text-[13px]">
            Register
          </Button>
        </div>
      </nav>
    </header>
  );
}