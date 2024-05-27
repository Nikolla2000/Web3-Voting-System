'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react";

export default function TransactionHash() {
    const searchParams = useSearchParams();
    const hash = searchParams.get('hash');
    const [transactionHash, setTransactionHash] = useState<string>('');

    useEffect(() => {
        if(hash) {
            setTransactionHash(hash);
        }
    }, [hash])

    return (
        <div>
            <h1>Transaction Hash</h1>
            <h2>{transactionHash}</h2>
        </div>
    );

}

