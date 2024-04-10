'use client'

import styles from "../../ui/votingPolls/styles.module.css";
import "./styles.css";
import { useEffect, useState } from "react";


type PercentagesProps = {
    "--left-percentage": string;
    "--right-percentage": string;
  };

export default function PercentageBar({ percentages }: {percentages: PercentagesProps}) {
    const [percentageNum, setPercentageNum] = useState({ left: 0, right: 0 });

    useEffect(() => {
        const percentInterval = setInterval(() => {
            if (percentageNum.left < parseFloat(percentages["--left-percentage"])) {
                setPercentageNum(prevState => ({ ...prevState, left: prevState.left + 1 }));
                if(percentageNum.right < parseFloat(percentages['--right-percentage'])) {
                    setPercentageNum(prevState => ({ ...prevState, right: prevState.right + 1 }))
                }
            } else if (percentageNum.right < parseFloat(percentages['--right-percentage'])) {
                setPercentageNum(prevState => ({ ...prevState, right: prevState.right + 1 }))
            } else {
                clearInterval(percentInterval);
            }
        }, 25);
    
        return () => clearInterval(percentInterval); // Clean up the interval on component unmount
    }, [percentageNum, percentages]);
    

    return (
        <div className={styles.percentBarWrapper} style={percentages}>
            <div className={`${styles.percentBar} ${styles.boxShadow}`}>
                <div className={styles.leftPercentBar}>
                    <div className={`${styles.leftPercentage} relative`} >
                        <span className="text-white text-lg font-bold absolute top-1/3 right-3">
                            {percentageNum.left}%
                        </span>
                    </div>
                </div>
                <div className={styles.rightPercentBar}>
                    <div className={`${styles.rightPercentage} relative`}>
                        <span className="text-white text-lg font-bold absolute top-1/3 left-3">
                            {percentageNum.right}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
    
} 