import { fetchPollsData } from "@/app/lib/data";

export default async function PollsBoard() {
  const data = await fetchPollsData();

  return (
    <div className="polls-board mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {data?.map((poll, i) => (
        <Card 
          pollData={poll}
          key={i + 1}/>
      ))}
    </div>
  )
}

export interface PollData {
  title: string,
  description: string,
  image: string,
  optionOne: string,
  optionTwo: string,
  votesFirstOption: number,
  votesSecondOption: number,
}

export function Card({ pollData } : { pollData: PollData }){
  return (
    <div className="cursor-pointer">
      <h3 className="text-purple-700 text-center font-bold my-5">{pollData.title}</h3>
      <div className="w-56 h-56 mx-auto">
        <img src={pollData.image} alt="poll image" className="w-full h-full"/>
      </div>
      <div className="text-center flex justify-center gap-5 my-4">
        <div>
          <span className="mr-1">{pollData.votesFirstOption}</span>
          <span>{pollData.optionOne}</span>
        </div>
        <span>vs</span>
        <div>
          <span>{pollData.optionTwo}</span>
          <span className="ml-1">{pollData.votesSecondOption}</span>
        </div>
      </div>
      <div>
        <p className="text-center">Total Votes: {pollData.votesFirstOption + pollData.votesSecondOption}</p>
      </div>
    </div>
  )
}