import { fetchPollById } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: {id: string} }) {
    const id = params.id;
    const poll = await fetchPollById(parseInt(id))

    if(!poll) {
        notFound();
    }

    return (
        <div>
            <h1>Poll №{poll.id} {poll.title}</h1>
        </div>
    )
}