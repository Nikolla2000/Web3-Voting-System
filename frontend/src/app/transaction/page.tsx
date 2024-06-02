import CongratMessage from "./CongratMessage";
import TransactionHash from "./TransactionHash";
import styles from './styles.module.css';

export default async function TransactionHashPage(){
    return (
        <div className="text-center py-10">
            <CongratMessage/>
            <TransactionHash/>
            <img src="/tesseract.gif" alt="Spinning tesseract"  className={`${styles.tesseract} hidden xl:block absolute w-96 top-1/4 right-28 opacity-35`}/>
            <img src="/tesseract.gif" alt="Spinning tesseract" className="hidden xl:block absolute w-96 top-1/4 left-28 opacity-35"/>
        </div>
    )
}