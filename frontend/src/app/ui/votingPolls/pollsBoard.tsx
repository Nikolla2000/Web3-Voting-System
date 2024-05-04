import { Poll } from "@/app/_types/types";
import Link from "next/link";
import styles from "./styles.module.css";
import { Suspense } from "react";
import { CardsSkeleton } from "../skeletons";

export default function PollsBoard({ pollsData }: { pollsData: Poll[] }) {
  return (
    <div className="mt-16 grid gap-10 sm:grid-cols-1 md:grid-cols-2 md:gap-20 lg:grid-cols-3 2xl:grid-cols-4">
      <Suspense fallback={<CardsSkeleton/>}>
      {pollsData?.map((poll) => (
        <Card 
          pollData={poll}
          key={poll.id}/>
      ))}
      </Suspense>
    </div>
  )
}

export function Card({ pollData } : { pollData: Poll }) {
  return (
    <Link 
      href={`/votingPolls/${pollData.id}`}
      className={`${styles.shadow} no-underline rounded-md w-80 mb-2 sm:w-72 mx-auto`}>
      <div className={`${styles.hovers} h-full flex flex-col justify-between`}>
        <div>
          <img src={pollData.mainImgURL} alt="poll-image"  className={`rounded-tl-md rounded-tr-md h-56 w-full`}/>
        </div>
        <div className="text-black text-center flex flex-col items-center py-3">
          <h3>{pollData.name}</h3>
          <p>{pollData.description}</p>
        </div>
        <div className={`${styles.noMargin} bg-blue-500 ${pollData.id % 2 !== 0 ? 'purple-gradient-background': ""} text-white flex flex-row float-bottom rounded-bl-md rounded-br-md justify-evenly text-center py-2`}>
          <div>
            <p>{pollData.votes1}</p>
            <p>{pollData.optionOneName}</p>
          </div>
          <div>
            <p>{pollData.votes1 + pollData.votes2}</p>
            <p>Total</p>
          </div>
          <div>
            <p>{pollData.votes2}</p>
            <p>{pollData.optionTwoName}</p>
          </div>
        </div>
      </div>     
    </Link>
  )
}
