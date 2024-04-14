import { fetchPollById } from "@/app/lib/data";
import { VoteButton } from "@/app/ui/votingPolls/VoteButton";
import { notFound } from "next/navigation";
import styles from "../../ui/votingPolls/styles.module.css";
import PercentageBar from "./PercentageBar";
import PollImage from "./PollImage";
import VoteModal from "./VoteModal";
import { Button } from "react-bootstrap";
import Link from "next/link";


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
                <h1 className="text-4.5xl font-bold text-blue-900 text-center pt-5">{poll.name}</h1>
                <div className="flex justify-center gap-2 p-14 pb-9">
                    <div>
                        <PollImage pollImg={poll.img1URL}/>
                        <p className="text-center my-4 font-bold text-xl">{poll.optionOneName}</p>              
                    </div>
                    <p className="self-end mb-4 text-xl">vs</p>
                    <div>
                        <PollImage pollImg={poll.img2URL}/>
                        <p className="text-center my-4 font-bold text-xl">{poll.optionTwoName}</p>              
                    </div>
                </div>
                <div>
                    <p className="text-center font-bold text-2xl w-3/4 mx-auto">{poll.description}</p>
                </div>
                <PercentageBar percentages={percentages}/>
                <div>
                    <div className="text-center mb-5">
                        <Button variant="success">
                            <Link 
                                href={`/votingPolls/${id}/statistics`}
                                className="text-white no-underline ">
                                View Statistics
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}