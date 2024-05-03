import { Poll } from "@/app/_types/types";
import Link from "next/link";
import styles from "./styles.module.css";

export default function PollsBoard({ pollsData }: { pollsData: Poll[] }) {
  return (
    <div className="mt-16 grid gap-10 sm:grid-cols-1 md:grid-cols-2 md:gap-20 lg:grid-cols-3 2xl:grid-cols-">
      {pollsData?.map((poll) => (
        <Card 
          pollData={poll}
          key={poll.id}/>
      ))}
      {pollsData?.map((poll) => (
        <Card 
          pollData={poll}
          key={poll.id}/>
      ))}
      {pollsData?.map((poll) => (
        <Card 
          pollData={poll}
          key={poll.id}/>
      ))}
    </div>
  )
}

// export function Card({ pollData }: { pollData: Poll }) {
//   return (
//     <div className="cursor-pointer">
//       <Link href={`/votingPolls/${pollData.id}`} className="no-underline">
//         <h3 className="text-purple-700 text-center font-bold my-5 no-underline">{pollData.name}</h3>
//         <div className="w-56 h-56 mx-auto">
//           <img src={pollData.mainImgURL} alt="poll image" className="w-full h-full rounded-xl"/>
//         </div>
//         <div className="bg-gray-500 rounded-bl-lg rounded-br-lg text-white font-bold py-1">
//           <div className="text-center flex justify-center gap-5 my-4">
//             <div>
//               <span className="mr-1">{pollData.votes1}</span>
//               <span>{pollData.optionOneName}</span>
//             </div>
//             <span>vs</span>
//             <div>
//               <span>{pollData.optionTwoName}</span>
//               <span className="ml-1">{pollData.votes2}</span>
//             </div>
//           </div>
//           <div>
//             <p className="text-center">Total Votes: {pollData.votes1 + pollData.votes2}</p>
//           </div>
//         </div>
//       </Link>
//     </div>
//   )
// }

export function Card({ pollData } : { pollData: Poll }) {
  return (
    <Link 
      href={`/votingPolls/${pollData.id}`}
      className={`${styles.shadow} no-underline rounded-md w-80 mb-10 sm:w-72 mx-auto`}>
      <div className={`${styles.hovers} h-full flex flex-col justify-between`}>
        <div>
          <img src={pollData.mainImgURL} alt="poll-image"  className={`rounded-tl-md rounded-tr-md h-56 w-full`}/>
        </div>
        <div className="text-black text-center flex flex-col items-center py-3">
          <h3>{pollData.name}</h3>
          <p>{pollData.description}</p>
        </div>
        <div className={`${styles.noMargin} bg-blue-500 text-white flex flex-row float-bottom rounded-bl-md rounded-br-md justify-evenly text-center py-2`}>
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
