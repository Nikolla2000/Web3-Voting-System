import { ChosenOption } from "../_types/types";
import api from "../../../axios.config";
import toast from "react-hot-toast";
import { EthWindow } from "../ui/metamask/MetamaskButton";
import Web3 from "web3";

export async function initWeb3() {
    const web3 = new Web3((window as any).ethereum);
    const contractAbi:any = process.env.NEXT_PUBLIC_CONTRACT_ABI;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const contract = new web3.eth.Contract(JSON.parse(contractAbi), contractAddress);
    const accounts: string[] = await web3.eth.getAccounts();
    const account = accounts[0];

    return { web3, contract, account };
}

export async function vote(chosenOption: ChosenOption, id: number, userId: number) {
    const endpoint = chosenOption === ChosenOption.First ? 
                    `/polls/vote1/${id}` 
                    : `/polls/vote2/${id}`;
    const requestData = { userId };
    // await api.put(endpoint, requestData);

    const { web3, contract, account } = await initWeb3();

    const option = chosenOption == ChosenOption.First ? 1 : 2;
    console.log(option)

    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await contract.methods.vote(id, option).estimateGas({ from: account })
    const gasCost = gasEstimate * BigInt(gasPrice);

    const balance = await web3.eth.getBalance(account);

    if(BigInt(balance) < gasCost) {
        toast.error('Not enough balance to cover gas fees');
        return;
    }
    const receipt = await contract.methods.vote(id, option).send({ 
        from: account, 
        gas: gasEstimate.toString(), 
        gasPrice: gasPrice.toString() 
    });

     // Listen VoteSuccess event
     contract.events.VoteSuccess({
        filter: { voter: account, pollId: id },
        fromBlock: receipt.blockNumber
    })
    .on('data', event => {
        console.log(event);
        const { pollName, option, message } = event.returnValues;
        toast.success(`Poll: ${pollName}, Option: ${option} - ${message}`);
    });

    console.log('Transaction Hash:', receipt.transactionHash);
    toast.success(`Vote successful! Transaction Hash: ${receipt.transactionHash}`);
    
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


//FOR LATER
// export async function createPoll(name, option1Name, option2Name) {
//     if (window.ethereum) {
//       const web3 = new Web3(window.ethereum);
//       const accounts = await web3.eth.getAccounts();
//       const account = accounts[0];
  
//       await votingContract.methods.createPoll(name, option1Name, option2Name).send({ from: account });
//     } else {
//       toast.error("Please install MetaMask to create a poll on the blockchain.");
//     }
//   }