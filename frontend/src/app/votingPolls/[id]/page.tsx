import { fetchPollById } from "@/app/lib/data";
import { VoteButton } from "@/app/ui/votingPolls/VoteButton";
import { notFound } from "next/navigation";
import styles from "./styles.module.css";
import PercentageBar from "./PercentageBar";


export default async function Page({ params }: { params: {id: string} }) {
    const id = params.id;
    const poll = await fetchPollById(parseInt(id))

    if(!poll) {
        notFound();
    }

    return (
        <div className="flex justify-center align-center min-h-screen">
            <div className="py-36  justify-center items-center">
                <h1 className="text-4xl font-bold text-blue-900 text-center">{poll.name}</h1>
                <div className="flex justify-center gap-2 p-10">
                    <div>
                        <div className="relative">
                            <img src={poll.img1URL} alt="First choice image" className={styles.images}/>
                            <VoteButton/> 
                        </div>
                        <p className="text-center my-5 font-bold text-xl">{poll.optionOneName}</p>              
                    </div>
                    <p className="self-end mb-6 text-xl">vs</p>
                    <div className="relative">
                        <div className="relative">
                            <img src={poll.img2URL} alt="Second choice image" className={styles.images}/>
                            <VoteButton/> 
                        </div>
                        <p className="text-center my-6 font-bold text-xl">{poll.optionTwoName}</p>              
                    </div>
                </div>
                <div>
                    <p className="text-center font-bold text-3xl">{poll.description}</p>
                </div>
                <PercentageBar/>
                <div>
                    <button>View Statistics</button>
                </div>
            </div>
        </div>
    )
}