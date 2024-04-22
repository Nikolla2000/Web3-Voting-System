'use client'

import { VoteButton } from "@/app/ui/votingPolls/VoteButton"
import styles from '../../ui/votingPolls/styles.module.css';
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VoteModal from "./VoteModal";
import { ChosenOption, Poll } from "@/app/_types/types";
import { fetchHasUserVoted } from "@/app/lib/data";

export default function PollImage({ poll, chosenOption } : {poll: Poll, chosenOption: ChosenOption}){
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [hasVoted, setHasVoted] = useState<boolean | null>(null);

    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const checkHasVoted = async () => {
          if(session?.user.id) {
            const result = await fetchHasUserVoted(session.user.id, poll.id);
            setHasVoted(result);
          }
        }
    
        checkHasVoted();;
      },[session?.user.id, poll.id])

    const openVoteModal = () => {
        if(!session || !session?.user) {
            router.push('/api/auth/signin')
        } else if (hasVoted) {
            return;
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
                    {!hasVoted && <><div className={`absolute ${!isHovered && 'hidden'} z-10 ${styles.voteBtn}`}>
                        <button className="z-20 bg-transparent  text-2xl font-bold uppercase py-4 px-10">
                            Vote
                        </button>
                    </div>
                    <div className={`${isHovered && styles.darkOverlay} cursor-pointer`}></div></>}
            </div>
            {showModal && <VoteModal 
                                show={showModal} 
                                setShow={setShowModal} 
                                poll={poll}
                                chosenOption={chosenOption}/>}
        </>
    )
}