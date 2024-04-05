import { fetchPollById } from "@/app/lib/data";
import { VoteButton } from "@/app/ui/votingPolls/VoteButton";
import { notFound } from "next/navigation";
import styles from "./styles.module.css";


export default async function Page({ params }: { params: {id: string} }) {
    const id = params.id;
    const poll = await fetchPollById(parseInt(id))

    if(!poll) {
        notFound();
    }

    return (
        <div className="flex justify-center align-center min-h-screen">
            <div className="py-36  justify-center items-center">
                <h1 className="text-3xl font-bold text-blue-900 text-center">{poll.name}</h1>
                <div className="flex justify-center gap-5 p-10">
                    <div className="relative">
                        <img src={poll.img1URL} alt="First choice image" className={styles.images}/>
                        <VoteButton/>                 
                    </div>
                    <div className="relative">
                        <img src={poll.img2URL} alt="Second choice image" className={styles.images}/>
                        <VoteButton/>
                    </div>
                </div>
                <div>
                    <p>{poll.description}</p>
                </div>
            </div>
        </div>
    )
}