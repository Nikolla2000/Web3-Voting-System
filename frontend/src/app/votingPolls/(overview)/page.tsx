import { fetchPollsData } from "@/app/lib/data";
import PollsBoard from "@/app/ui/votingPolls/pollsBoard";
import "./polls.css";
import { TypewriterEffect } from "@/app/ui/typeWriterEffects/MainTypewriterEffect";
import { pollsPageStrings } from "@/app/ui/typeWriterEffects/typewriterStrings";
import GoBackButton from "@/app/ui/goBackButton/GoBackButton";

export default async function Page() {
  const data = await fetchPollsData();

  return (
    <main className="">
      <h1 className="text-blue-700 text-5xl font-bold h-16">
        <TypewriterEffect strings={pollsPageStrings}/>
      </h1>
      <PollsBoard pollsData={data}/>
      <div className="float-right my-5">
        <GoBackButton path='/'>Go Back</GoBackButton>
      </div>
    </main>
  )
}