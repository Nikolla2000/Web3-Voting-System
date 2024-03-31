import { fetchPollsData } from "@/app/lib/data";
import PollsBoard from "@/app/ui/votingPolls/pollsBoard";

export default async function Page() {
  const data = await fetchPollsData();

  return (
    <main className="p-20">
      <h1 className="text-blue-700 text-4xl text-center font-bold">Polls</h1>
      <PollsBoard pollsData={data}/>
    </main>
  )
}