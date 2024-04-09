'use client'

import { VoteButton } from "@/app/ui/votingPolls/VoteButton"
import styles from './styles.module.css';
import { useState } from "react";

export default function PollImage({ pollImg } : any){
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className={`relative ${styles.boxShadow} rounded-lg`} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
                <img src={pollImg} alt="First choice image" className={styles.images}/>
                <VoteButton isHovered={isHovered}/> 
        </div>
    )
}