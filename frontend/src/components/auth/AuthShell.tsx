import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { HexGrid } from '@/components/home/HexGrid';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-[#f8f9ff] to-[#f2f3fd] px-6 py-16">
      <HexGrid />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <Image src="/logo-static.png" alt="VoteChain logo" width={30} height={30} />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            VoteChain
          </span>
        </Link>

        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-[0_20px_60px_-20px_rgba(79,70,229,0.25)] backdrop-blur-sm sm:p-10">
          <h1 className="font-display text-center text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </main>
  );
}