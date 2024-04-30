'use client'

import { useMetamask } from "../MetamaskProvider";
import styles from "./styles.module.css";

export default function MetamaskAccount() {
    const { connectedAccount } = useMetamask();

    return (
        <>
            {connectedAccount && (
                <div className={`${styles.accountString} font-bold text-center absolute`}>
                    <div className="flex flex-row justify-center items-center gap-2">
                        <img src="/metamask.png" alt="metamask-logo"  className="w-7 mb-3"/>
                        <p>Connected Account:</p>
                    </div>
                    <p className={`${styles.account} text-sm`}>{connectedAccount}</p>
                </div>
            )}
        </>
    );
}