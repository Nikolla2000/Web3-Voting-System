'use client'

import { VoteButton } from "@/app/ui/votingPolls/VoteButton"
import styles from '../../ui/votingPolls/styles.module.css';
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VoteModal from "./VoteModal";

export default function PollImage({ pollImg, chosenOption } : { pollImg: string, chosenOption: string}){
    const [isHovered, setIsHovered] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const { data: session } = useSession();
    const router = useRouter();


    const openVoteModal = () => {
        if(!session || !session?.user) {
            router.push('/api/auth/signin')
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
                    <img src={pollImg} alt="Poll image" className={styles.images}/>
                    <VoteButton isHovered={isHovered}/>
                    <div className={`${isHovered && styles.darkOverlay} cursor-pointer`}></div>
            </div>
            {showModal && <VoteModal show={showModal} setShow={setShowModal} chosenOption={chosenOption}/>}
        </>
    )
}