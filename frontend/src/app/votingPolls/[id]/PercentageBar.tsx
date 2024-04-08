'use client'

import styles from "./styles.module.css";

export default function PercentageBar() {
    const votes1 = 3;
    const votes2 = 2;

    const percentages = {
        '--left-percentage' : `${votes1 / (votes1 + votes2) * 100}%`,
        '--right-percentage' : `${votes2 / (votes1 + votes2) * 100}%`,
    }

    return (
        <div className={styles.percentBarWrapper} style={percentages}>
            <div className={styles.percentBar}>
                <div className={styles.leftPercentBar}>
                    <div className={`${styles.leftPercentage} relative`} >
                        <span className="text-white text-lg font-bold absolute top-1/3 right-3">
                            0 %
                        </span>
                    </div>
                </div>
                <div className={styles.rightPercentBar}>
                    <div className={`${styles.rightPercentage} relative`}>
                        <span className="text-white text-lg font-bold absolute top-1/3 left-3">
                            0%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
    
} 