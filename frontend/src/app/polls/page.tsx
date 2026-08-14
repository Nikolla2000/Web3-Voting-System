import { Navbar } from '@/components/layout/Navbar';
import { HexGrid } from '@/components/home/HexGrid';
import { PollsPageHeader } from '@/components/polls/PollsPageHeader';
import { PollsExplorer } from '@/components/polls/PollsExplorer';
import { mockPolls } from '@/lib/polls/mock';

export default function PollsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f8f9ff] to-[#f2f3fd]">
      <HexGrid />
      <Navbar />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 lg:pt-8">
        <PollsPageHeader />
        <PollsExplorer initialPolls={mockPolls} />
      </section>
    </main>
  );
}