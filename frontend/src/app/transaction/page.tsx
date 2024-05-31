import { fetchPollById } from "../lib/data";
import CongratMessage from "./CongratMessage";
import TransactionHash from "./TransactionHash";

export default async function TransactionHashPage(){
    return (
        <div>
            <CongratMessage/>
            <TransactionHash/>
        </div>
    )
}