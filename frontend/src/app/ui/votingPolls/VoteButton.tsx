'use client'

import { vote } from "@/app/lib/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function VoteButton() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleVote = () => {
        if(!session || !session?.user) {
            router.push('/api/auth/signin')
        } else {
            vote();
        }
    }
    return (
        <div className="absolute top-1/2 left-36 bg-white">
            <button onClick={handleVote}>
                Vote
            </button>
        </div>
    )
}