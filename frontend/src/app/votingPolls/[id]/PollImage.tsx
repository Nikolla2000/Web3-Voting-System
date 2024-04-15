'use client'

import { VoteButton } from "@/app/ui/votingPolls/VoteButton"
import styles from '../../ui/votingPolls/styles.module.css';
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VoteModal from "./VoteModal";
import { ChosenOption, Poll } from "@/app/_types/types";

export default function PollImage({ poll, chosenOption } : {poll: Poll, chosenOption: ChosenOption}){
    const [isHovered, setIsHovered] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const { data: session } = useSession();
    const router = useRouter();

    const openVoteModal = () => {
        if(!session || !session?.user) {
            // router.push('/api/auth/signin')
            setShowModal(true);
            setIsHovered(false);
        } else {
            setShowModal(true);
            setIsHovered(false);
        }
    }

    return (
        <>
            <div 
                className={`relative ${styles.boxShadow} rounded-lg`} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={openVoteModal}>
                    <img src={chosenOption === 'first' ? poll.img1URL : poll.img2URL} alt="Poll image" className={styles.images}/>
                    <VoteButton isHovered={isHovered}/>
                    <div className={`${isHovered && styles.darkOverlay} cursor-pointer`}></div>
            </div>
            {showModal && <VoteModal 
                                show={showModal} 
                                setShow={setShowModal} 
                                poll={poll}
                                chosenOption={chosenOption}/>}
        </>
    )
}