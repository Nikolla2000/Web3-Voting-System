import { fetchPollsData } from "@/app/lib/data";
import PollsBoard from "@/app/ui/votingPolls/pollsBoard";
import "./polls.css";
import { TypewriterEffect } from "@/app/ui/typeWriterEffects/MainTypewriterEffect";
import { pollsPageStrings } from "@/app/ui/typeWriterEffects/typewriterStrings";
import PollsBoardClient from "@/app/ui/votingPolls/PollBoardClient";

export default async function Page() {
  const data = await fetchPollsData();

  return (
    <main className="">
      <h1 className="text-blue-700 text-5xl font-bold h-16">
        <TypewriterEffect strings={pollsPageStrings}/>
      </h1>
      <PollsBoardClient pollsData={data} />
    </main>
  )
}