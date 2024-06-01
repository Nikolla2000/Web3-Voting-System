'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
            <h1>Congratulations, you voted for "{details.chosenOpt}" in the "{details.pollname}" poll</h1>
            <div>
                <img src={details.image} alt="poll image" />
            </div>
        </>
    )
}