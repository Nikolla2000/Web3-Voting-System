'use client'

import { connectMetamask } from "@/app/lib/actions";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import styles from './styles.module.css';
import Web3 from "web3";

export interface EthWindow {
    ethereum?: any; 
}

export default function MetamaskButton() {
    const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
    const { data: session } = useSession();

    const connect = async () => {
        if (!session) {
            toast.error('Please log in to connect to MetaMask');
            return;
        }
        connectMetamask(setConnectedAccount)
    }

    return (
        !session?.user.id && (
            <div className={styles.metamaskButtonWrapper}>
                {!connectedAccount && <button onClick={() => connect()} className="flex flex-row  gap-2 items-center bg-white border-1 border-gray-400 rounded-xl py-1 px-2">
                    <img src="/metamask.png" alt="metamask-logo" className="w-5"/>
                    <span className="font-bold">Connect to Metamask</span>
                </button>}
                <h2>{connectedAccount}</h2>
            </div>
        )
    );
    
}