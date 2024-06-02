'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react";
import styles from './styles.module.css';

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
            <h3 className={`${styles.message}`}>
                Your vote was recorded in the Sepolia network on the Etherium Blockchain
            </h3>
            <h3 className={`${styles.message2}`}>View Your Transaction on Etherscan below</h3>
            <p className="mt-16 text-2xl font-bold">Transaction Hash:</p>
            <p>
                <a  href={`${etherscanLink}/${transactionHash}`} className="text-blue-700 text-2xl font-bold block break-words" target="_blank">
                    {transactionHash}
                </a>
            </p>
        </div>
    );

}

