'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react";

export default function TransactionHash() {
    const searchParams = useSearchParams();
    const hash = searchParams.get('hash');
    const [transactionHash, setTransactionHash] = useState<string>('');
    const etherscanLink = 'https://sepolia.etherscan.io/tx';

    useEffect(() => {
        if(hash) {
            setTransactionHash(hash);
        }
    }, [hash])

    return (
        <div className="text-center">
            <h3>Your vote was recorded in the Sepolia network on the Etherium Blockchain</h3>
            <h3>View Your Transaction on Etherscan</h3>
            <p>Transaction Hash:</p>
            <p>
                <a  href={`${etherscanLink}/${transactionHash}`} target="_blank">
                    {transactionHash}
                </a>
            </p>
        </div>
    );

}

