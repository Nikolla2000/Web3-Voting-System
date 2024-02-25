import PollsBoard from "@/app/ui/votingPolls/pollsBoard";

export default function Page() {
  return (
    <main className="p-20">
      <h1 className="text-blue-700 text-4xl text-center font-bold">Polls</h1>
      <PollsBoard/>
    </main>
  )
}