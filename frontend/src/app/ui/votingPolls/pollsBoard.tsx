import { fetchPollsData } from "@/lib/data";

export default async function PollsBoard() {
  const data = await fetchPollsData();

  return (
    <div>
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
}

export function Card({ pollData } : { pollData: PollData }){
  return (
    <div>
      <h3>{pollData.title}</h3>
      <p>{pollData.description}</p>
    </div>
  )
}