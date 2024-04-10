'use client'

import { vote } from "@/app/lib/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css"

export function VoteButton({ isHovered } : {isHovered: boolean}) {
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
        <div className={`absolute ${!isHovered && 'hidden'} z-10 ${styles.voteBtn}`}>
            <button onClick={handleVote} className="z-20 bg-transparent text-white text-3xl font-bold uppercase border-2 py-4 px-10">
                Vote
            </button>
        </div>
    )
}