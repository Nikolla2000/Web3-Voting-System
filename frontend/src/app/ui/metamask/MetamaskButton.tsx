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
        // if (!session || !session.user.id) {
        //     toast.error('Please log in to connect to MetaMask');
        //     return;
        // }
        connectMetamask(setConnectedAccount)
    }

    return (
        !session?.user.id && (
            <a className={`${styles.shadow} ${styles.metamaskButton} w-53 relative inline-flex items-center justify-center text-lg font-bold text-white transition-all duration-200 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 no-underline`}>
                {!connectedAccount && <button onClick={() => connect()} className="flex flex-row  gap-2 items-center bg-white border-1 border-gray-400 rounded-xl py-1 px-2">
                    <img src="/metamask.png" alt="metamask-logo" className="w-5"/>
                    <span className="font-bold text-black py-1">Connect to Metamask</span>
                </button>}
                {/* <h2>{connectedAccount}</h2> */}
            </a>
        )
    );
    
}