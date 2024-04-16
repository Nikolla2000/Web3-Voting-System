import { ChosenOption } from "../_types/types";
import api from "../../../axios.config";

export async function vote(chosenOption: ChosenOption, id: number) {
    if(chosenOption == ChosenOption.First) {
        await api.put(`/polls/vote1/${id}`);
    } else {
        await api.put(`/polls/vote2/${id}`);
    }
}
