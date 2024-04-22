import { ChosenOption } from "../_types/types";
import api from "../../../axios.config";

export async function vote(chosenOption: ChosenOption, id: number, userId: number) {
    const endpoint = chosenOption === ChosenOption.First ? 
                    `/polls/vote1/${id}` 
                    : `/polls/vote2/${id}`;
    const requestData = { userId };
    await api.put(endpoint, requestData);
}