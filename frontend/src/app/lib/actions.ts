import { ChosenOption } from "../_types/types";
import api from "../../../axios.config";
import toast from "react-hot-toast";
import { EthWindow } from "../ui/metamask/MetamaskButton";
import Web3 from "web3";

export async function vote(chosenOption: ChosenOption, id: number, userId: number) {
    const endpoint = chosenOption === ChosenOption.First ? 
                    `/polls/vote1/${id}` 
                    : `/polls/vote2/${id}`;
    const requestData = { userId };
    await api.put(endpoint, requestData);
}

export async function connectMetamask(setAccount: (account: string | null) => void) {
    if ((window as EthWindow).ethereum) {
        const web3 = new Web3((window as EthWindow).ethereum);

        try {
            await (window as EthWindow).ethereum.request({ method: 'eth_requestAccounts' });

            const accounts = await web3.eth.getAccounts();

            setAccount(accounts[0]);
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            toast.error('Error connecting to MetaMask. Please try again.');
        }
    } else {
        toast.error('Please download MetaMask to connect to Ethereum');
    }
}