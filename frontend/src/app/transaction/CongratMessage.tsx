'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CongratMessage() {
    const searchParams = useSearchParams();
    const pollName = searchParams.get('pollName');
    const chosenOptName = searchParams.get('chosenOpt');
    const [details, setDetails] = useState({
        pollname: '',
        chosenOpt: ''
    })

    useEffect(() => {
        if(pollName && chosenOptName) {
            setDetails({
                pollname: pollName,
                chosenOpt: chosenOptName
            });
        }
    }, [pollName, chosenOptName])

    return (
        <div>
            <h1>Congratulations, you voted in the {details.pollname} poll for the {details.chosenOpt} option!</h1>
        </div>
    )
}