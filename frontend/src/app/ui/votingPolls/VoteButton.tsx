'use client'

import { connectMetamask, vote } from "@/app/lib/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css"
import { Button } from "react-bootstrap";
import { ChosenOption, Poll } from "@/app/_types/types";
import { useMetamask } from "../MetamaskProvider";
import toast from "react-hot-toast";
import MetamaskButton from "../metamask/MetamaskButton";
import { useState } from "react";

export function VoteButton({ chosenOption, poll } : { chosenOption: ChosenOption, poll: Poll}) {
    const { data: session } = useSession();
    const { connectedAccount, setConnectedAccount } = useMetamask();
    const [showMetamaskBtn, setShowMetamaskBtn] = useState<boolean>(false)
    const chosenOptName = chosenOption == ChosenOption.First ? poll.optionOneName : poll.optionTwoName;
    const router = useRouter();

    const handleVote = async () => {
        if(!session || !session?.user) {
            router.push('/api/auth/signin')
        } else if(!connectedAccount) {
            toast.error("You need to connect to Metamask to vote.")
            setShowMetamaskBtn(true);
        }else {
            const transactionHash = await vote(chosenOption, poll.id, session?.user.id);
            router.push(`/transaction?hash=${transactionHash}?pollName=${poll.name}?chosenOpt=${chosenOptName}`);
        }
    }
    return (
        <>
            {showMetamaskBtn && <p className="text-blue-600 font-bold">Connect to Metamask from the button below</p>}
            <div className="flex flex-row justify-center gap-2">
                <Button variant="primary" onClick={handleVote}>
                    {`Vote for ${chosenOption == ChosenOption.First ? poll.optionOneName : poll.optionTwoName}`}
                </Button>
                {showMetamaskBtn && <MetamaskButton/>}
            </div>
        </>
    )
}