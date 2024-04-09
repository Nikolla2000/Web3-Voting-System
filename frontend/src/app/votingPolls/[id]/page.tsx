import { fetchPollById } from "@/app/lib/data";
import { VoteButton } from "@/app/ui/votingPolls/VoteButton";
import { notFound } from "next/navigation";
import styles from "./styles.module.css";
import PercentageBar from "./PercentageBar";
import PollImage from "./PollImage";


export default async function Page({ params }: { params: {id: string} }) {
    const id = params.id;
    const poll = await fetchPollById(parseInt(id))

    if(!poll) {
        notFound();
    }

    const percentages = {
        '--left-percentage': `${poll.votes1 / (poll.votes1 + poll.votes2) * 100}%`,
        '--right-percentage': `${poll.votes2 / (poll.votes1 + poll.votes2) * 100}%`
    }

    console.log(percentages['--right-percentage'])
    console.log(poll);

    return (
        <div className="flex justify-center align-center min-h-screen">
            <div className="justify-center items-center">
                <h1 className="text-5xl font-bold text-blue-900 text-center pt-5">{poll.name}</h1>
                <div className="flex justify-center gap-2 p-14">
                    <div>
                        {/* <div className={`relative ${styles.boxShadow} rounded-lg`}>
                            <img src={poll.img1URL} alt="First choice image" className={styles.images}/>
                            <VoteButton/> 
                        </div> */}
                        <PollImage pollImg={poll.img1URL}/>
                        <p className="text-center my-5 font-bold text-xl">{poll.optionOneName}</p>              
                    </div>
                    <p className="self-end mb-6 text-xl">vs</p>
                    <div>
                        <div className={`relative ${styles.boxShadow} rounded-lg`}>
                            <img src={poll.img2URL} alt="Second choice image" className={styles.images}/>
                            <VoteButton/> 
                        </div>
                        <p className="text-center my-6 font-bold text-xl">{poll.optionTwoName}</p>              
                    </div>
                </div>
                <div>
                    <p className="text-center font-bold text-3xl w-3/4 mx-auto">{poll.description}</p>
                </div>
                <PercentageBar percentages={percentages}/>
                <div>
                    <button>View Statistics</button>
                </div>
            </div>
        </div>
    )
}