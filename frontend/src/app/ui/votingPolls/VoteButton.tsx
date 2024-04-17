'use client'

import { vote } from "@/app/lib/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css"
import { Button } from "react-bootstrap";
import { ChosenOption, Poll } from "@/app/_types/types";

export function VoteButton({ chosenOption, poll } : { chosenOption: ChosenOption, poll: Poll}) {
    const { data: session } = useSession();
    const router = useRouter();

    const handleVote = () => {
        if(!session || !session?.user) {
            router.push('/api/auth/signin')
        } else {
            vote(chosenOption, poll.id, session?.user.id);
        }
        // window.location.reload();
    }
    return (
        <Button variant="primary" onClick={handleVote}>
            {`Vote for ${chosenOption == ChosenOption.First ? poll.optionOneName : poll.optionTwoName}`}
        </Button>
    )
}