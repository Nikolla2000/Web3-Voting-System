import { Poll } from "@/app/_types/types";
import Link from "next/link";
import styles from "./styles.module.css";
import { Suspense } from "react";
import { CardsSkeleton } from "../skeletons";
import { divideData } from "@/app/lib/actions";
import { Carousel, CarouselItem } from "react-bootstrap";

export default function PollsBoard({ pollsData, chunkSize }: { pollsData: Poll[], chunkSize: number }) {
  const dividedData = divideData(pollsData, chunkSize);
  return (
    <div className="mt-16">
      <Suspense fallback={<CardsSkeleton />}>
        <Carousel>
          {dividedData?.map((polls, i) => (
            <CarouselItem key={i}>
              <div className="flex flex-row gap-10">
              {polls.map((poll, j) => (
                <Card 
                  pollData={poll}
                  index={j + 1}
                  key={poll.id}
                />
              ))}
              </div>
            </CarouselItem>
          ))}
        </Carousel>
      </Suspense>
    </div>
  );
}

export function Card({ pollData, index } : { pollData: Poll, index: number }) {
  return (
    <Link 
      href={`/votingPolls/${pollData.id}`}
      className={`${styles.shadow} no-underline rounded-md w-80 mb-2 sm:w-72 mx-auto bg-white`}>
      <div className={`${styles.hovers} h-full flex flex-col justify-between`}>
        <div>
          <img src={pollData.mainImgURL} alt="poll-image"  className={`rounded-tl-md rounded-tr-md h-56 w-full`}/>
        </div>
        <div className={`${styles.pollCardBg} text-black text-center flex flex-col items-center py-3`}>
          <h3 className={styles.pollName}>{pollData.name}</h3>
          <p className={styles.pollDescription}>{pollData.description}</p>
        </div>
        <div className={`${styles.noMargin} bg-blue-500 ${index % 2 !== 0 ? 'purple-gradient-background': ""} text-white flex flex-row float-bottom rounded-bl-md rounded-br-md justify-evenly text-center py-2`}>
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
