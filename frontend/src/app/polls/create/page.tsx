import { Navbar } from '@/components/layout/Navbar';
import { HexGrid } from '@/components/home/HexGrid';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CreatePollPageHeader } from '@/components/polls/CreatePollPageHeader';
import { CreatePollForm } from '@/components/polls/CreatePollForm';

export default function CreatePollPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f8f9ff] to-[#f2f3fd]">
      <HexGrid />
      <Navbar />

      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-10 lg:pt-8">
        <RequireAuth>
          <CreatePollPageHeader />
          <CreatePollForm />
        </RequireAuth>
      </section>
    </main>
  );
}
