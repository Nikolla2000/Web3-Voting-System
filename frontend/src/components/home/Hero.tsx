'use client';

import { Button } from '@/components/ui/Button';
import { PulseRings } from '@/components/home/PulseRings';
import { useAuthStore } from '@/lib/store/auth-store';

export function Hero() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = status === 'authenticated' && user;

  return (
    <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-28 pt-10 text-center lg:pt-8">
      <span className="mb-5 inline-flex items-center rounded-full border border-indigo-100 bg-white/70 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-indigo-600 backdrop-blur-sm">
        Secured by the blockchain · Verifiable by anyone
      </span>

      <div className="relative mb-5 flex h-[350px] w-[350px] items-center justify-center">
        <PulseRings />
        <video
            src="/logo.webm"
            width={300}
            height={300}
            autoPlay
            loop
            muted
            playsInline
            className="relative object-contain"
            />
      </div>

      <h1 className="font-display text-4xl font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
        <span className="block text-lg font-normal text-slate-500 sm:text-xl">
          {/* {isAuthenticated ? 'Welcome back,' : 'Welcome to'} */}
          Welcome to
        </span>
        {/* {isAuthenticated ? user.username : 'Web3 Voting System'}
         */}
         Web3 Voting System
      </h1>

      <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-slate-500 sm:text-lg">
        {isAuthenticated
          ? 'Your account is ready. Explore active elections and make your vote count.'
          : <span>Every vote is cast, counted and verified on-chain. <br/> No intermediaries, no black boxes.<br/>Connect your wallet and take part in elections you can audit yourself.</span>}
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        {isAuthenticated ? (
          <Button href="/polls" variant="primary">
            View polls
          </Button>
        ) : (
          <>
            <Button href="/register" variant="primary">
              Sign in / Register
            </Button>
            <Button href="/polls" variant="secondary">
              View polls
            </Button>
          </>
        )}
      </div>
    </section>
  );
}