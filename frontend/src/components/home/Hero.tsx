import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { PulseRings } from '@/components/home/PulseRings';

export function Hero() {
  return (
    <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-28 pt-10 text-center lg:pt-8">
      <span className="mb-5 inline-flex items-center rounded-full border border-indigo-100 bg-white/70 px-4 py-0 font-mono text-[11px] uppercase tracking-[0.14em] text-indigo-600 backdrop-blur-sm">
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
          Welcome to
        </span>
        Web3 Voting System
      </h1>

      <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-slate-500 sm:text-lg">
        Every vote is cast, counted and verified on-chain.<br/>No intermediaries,
        no black boxes.<br/>Connect your wallet and take part in elections you
        can audit yourself.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Button href="/register" variant="primary">
          Sign in / Register
        </Button>
        <Button href="/polls" variant="secondary">
          View polls
        </Button>
      </div>
    </section>
  );
}