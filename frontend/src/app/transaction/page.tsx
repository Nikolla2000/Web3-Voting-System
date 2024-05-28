import { fetchPollById } from "../lib/data";
import TransactionHash from "./TransactionHash";

export default async function TransactionHashPage(){
    return (
        <div>
            Transaction hash page
            <TransactionHash/>
        </div>
    )
}