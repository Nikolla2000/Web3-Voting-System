'use client'

import { VoteButton } from "@/app/ui/votingPolls/VoteButton"
import styles from '../../ui/votingPolls/styles.module.css';
import { useState } from "react";
import VoteModal from "./VoteModal";


export default function PollImage({ pollImg } : { pollImg: string}){
    const [isHovered, setIsHovered] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleClick = () => {
        setShowModal(true);
        setIsHovered(false);
    }

    return (
        <>
            <div 
                className={`relative ${styles.boxShadow} rounded-lg`} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}>
                    <img src={pollImg} alt="Poll image" className={styles.images}/>
                    <VoteButton isHovered={isHovered}/>
                    <div className={`${isHovered && styles.darkOverlay} cursor-pointer`}></div>
            </div>
            {showModal && <VoteModal show={showModal} setShow={setShowModal}/>}
        </>
    )
}