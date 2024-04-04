import { fetchPollById } from "@/app/lib/data";
import { VoteButton } from "@/app/ui/votingPolls/VoteButton";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: {id: string} }) {
    const id = params.id;
    const poll = await fetchPollById(parseInt(id))

    if(!poll) {
        notFound();
    }

    return (
        <div className="mx-auto w-1/2 py-10">
            <h1>Poll №{poll.id} {poll.name}</h1>
            <div className="w-20">
                <img src={poll.img1URL} alt="First choice image" />
                <img src={poll.img2URL} alt="Second choice image" />
            </div>
            <div>
                <p>{poll.description}</p>
            </div>
            <VoteButton/>
        </div>
    )
}