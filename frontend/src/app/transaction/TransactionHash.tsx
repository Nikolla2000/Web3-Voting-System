'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react";

export default function TransactionHash() {
    const searchParams = useSearchParams();
    const hash = searchParams.get('hash');
    const [transactionHash, setTransactionHash] = useState<string>('');
    const etherscanLink = 'https://sepolia.etherscan.io/tx';

    useEffect(() => {
        if(true) {
            setTransactionHash('0xB55B8F4c6019c8290c5560b86DEE23fCA185704f');
        }
    }, [hash])

    return (
        <div className="text-center">
            <h2>View Your Transaction on Etherscan</h2>
            <h2>Transaction Hash:</h2>
            <h2>
                <a  href={`${etherscanLink}/${transactionHash}`} target="_blank">
                    {transactionHash}
                </a>
            </h2>
        </div>
    );

}

