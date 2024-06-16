export default function ReadmePage() {
  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Important Information</h1>
      <p className="mb-4">
        Hello and Welcome to my Web3 Voting App. This application allows users to vote on different polls, and the votes are securely stored on the Sepolia test network on the Ethereum blockchain.
      </p>
      <h2 className="text-2xl font-bold mb-2">Getting Started</h2>
      <p className="mb-4">
        To participate in the voting process, you will need some test ether. Here’s what you need to know:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>You will need a MetaMask wallet or another Ethereum-compatible wallet to interact with the blockchain.</li>
        <li>The votes are recorded on the Sepolia test network, which is a test version of the Ethereum blockchain.</li>
        <li>Using the Sepolia test network requires test ether, which can be obtained for free from a faucet.</li>
      </ul>
      <h2 className="text-2xl font-bold mb-2">How to Get Test Ether</h2>
      <p className="mb-4">
        Since I cannot cover the cost of all transactions, you will need to obtain test ether yourself. Follow these steps to get some test ether:
      </p>
      <ol className="list-decimal list-inside mb-4">
        <li>Open your web browser and go to Google.</li>
        <li>Search for "Sepolia faucet" or use <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia">This link</a> directly.</li>
        <li>Choose a faucet from the search results and follow the instructions to receive free test ether daily.</li>
        <li>Make sure to send the test ether to the wallet address you are using for this app.</li>
      </ol>
      <p className="mb-4">
        Once you have test ether in your wallet, you can participate in the polls and cast your votes.
      </p>
      <h2 className="text-2xl font-bold mb-2">Need Help?</h2>
      <p>
        If you have any questions or run into issues, feel free to reach out for support. Happy voting!
      </p>
    </div>
  );
}