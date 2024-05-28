import { useSearchParams } from "next/navigation";

export default function CongratMessage() {
    const searchParams = useSearchParams();
    const pollName = searchParams.get('pollName');
    const chosenOptName = searchParams.get('chosenOpt');

    return (
        <div>
            <h1>Congratulations, you voted in the {pollName} poll for the {chosenOptName} option!</h1>
        </div>
    )
}