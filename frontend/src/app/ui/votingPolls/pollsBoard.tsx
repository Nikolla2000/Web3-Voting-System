import { Poll } from "@/app/_types/types";
import Link from "next/link";


export default function PollsBoard({ pollsData }: { pollsData: Poll[] }) {
console.log(pollsData);
  return (
    <div className="polls-board mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {pollsData?.map((poll) => (
        <Card 
          pollData={poll}
          key={poll.id}/>
      ))}
    </div>
  )
}

export function Card({ pollData }: { pollData: Poll }) {
  return (
    <div className="cursor-pointer">
      <Link href={`/votingPolls/${pollData.id}`}>
        <h3 className="text-purple-700 text-center font-bold my-5">{pollData.name}</h3>
        <div className="w-56 h-56 mx-auto">
          <img src={pollData.mainImgUrl} alt="poll image" className="w-full h-full"/>
        </div>
        <div className="text-center flex justify-center gap-5 my-4">
          <div>
            <span className="mr-1">{pollData.votes1}</span>
            <span>{pollData.optionOne}</span>
          </div>
          <span>vs</span>
          <div>
            <span>{pollData.optionTwo}</span>
            <span className="ml-1">{pollData.votes2}</span>
          </div>
        </div>
        <div>
          <p className="text-center">Total Votes: {pollData.votes1 + pollData.votes2}</p>
        </div>
      </Link>
    </div>
  )
}
