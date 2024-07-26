'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './styles.module.css';
import styles2 from '../ui/votingPolls/styles.module.css';

export default function CongratMessage() {
    const searchParams = useSearchParams();
    const pollName = searchParams.get('pollName');
    const chosenOptName = searchParams.get('chosenOpt');
    const img = searchParams.get('img');
    const [details, setDetails] = useState({
        pollname: '',
        chosenOpt: '',
        image: ''
    })

    console.log(pollName, chosenOptName, img);

    useEffect(() => {
        if(pollName && chosenOptName && img) {
            setDetails({
                pollname: pollName,
                chosenOpt: chosenOptName,
                image: img
            });
        }
    }, [pollName, chosenOptName])

    return (
        <>
            <h1 className={`${styles.title} my-12 font-bold px-5 md:px-0 text-3xl lg:text-4xl  text-center`}>
            Congratulations, you voted for &quot;{details.chosenOpt}&quot; in the &quot;{details.pollname}&quot; poll
            </h1>
            <div className={`${styles2.boxShadow} mx-auto inline-block w-80 lg:w-1/4 border border-black border-1 rounded-lg mb-10`}>
                <img src={`/polls-images/beach.webp`} alt="poll image" className="w-full h-full rounded-lg"/>
            </div>
        </>
    )
}