import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { HexGrid } from '@/components/home/HexGrid';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f8f9ff] to-[#f2f3fd]">
      <HexGrid />
      <Navbar />
      <Hero />
    </main>
  );
}