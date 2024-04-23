'use client'

import { connectMetamask } from "@/app/lib/actions";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
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
        session?.user.id && (
            <div>
                <button onClick={() => connect()}>Connect To Metamask</button>
                <h2>{connectedAccount}</h2>
            </div>
        )
    );
    
}