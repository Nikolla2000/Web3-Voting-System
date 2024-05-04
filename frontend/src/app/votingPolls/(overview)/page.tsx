import { fetchPollsData } from "@/app/lib/data";
import PollsBoard from "@/app/ui/votingPolls/pollsBoard";
import "./polls.css";

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 5000)); // Delay for 5 seconds
  const data = await fetchPollsData();

  return (
    <main className="">
      <h1 className="text-blue-700 text-5xl font-bold">POLLS</h1>
      <PollsBoard pollsData={data}/>
    </main>
  )
}