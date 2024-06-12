const funFacts = [
    "The first blockchain was conceptualized by an anonymous person or group known as Satoshi Nakamoto in 2008 and implemented the following year as a core component of the digital currency Bitcoin.",
    "Blockchain was initially developed to timestamp digital documents to prevent tampering and backdating.",
    "Blockchain can be used for more than just cryptocurrencies; it has applications in supply chain management, healthcare, voting systems, and more.",
    "The first real-world transaction using Bitcoin was in May 2010, when a programmer paid 10,000 bitcoins for two pizzas.",
    "The Ethereum blockchain introduced the concept of smart contracts, which are self-executing contracts with the terms of the agreement directly written into code.",
    "Blockchain technology allows for peer-to-peer transactions without the need for intermediaries like banks.",
    "Blockchain is considered to be secure due to its decentralized nature, making it extremely difficult for hackers to alter or tamper with the data.",
    "The energy consumption of Bitcoin mining has led to environmental concerns, prompting some efforts to find more sustainable mining practices.",
    "Some blockchains use proof-of-work consensus algorithms, while others use proof-of-stake or other methods to validate transactions.",
    "The number of blockchain projects and cryptocurrencies has grown significantly since Bitcoin's inception, with thousands of different tokens and coins in existence today."
  ];
  
  const instructions = [
    {
      id: '1',
      message: "Hi, I'm your AI Assistant, what is your name?",
      trigger: 'name',
    },
    {
      id: 'ask-help',
      options: [
        { value: 'Yes', label: 'Yes', trigger: 'yes-follow-up' },
        { value: 'No', label: 'No, thanks', trigger: 'help-no' },
      ],
    },
    {
      id: 'ask-name',
      message:'Great, what is your name?',
      trigger: 'name'
    },
    {
      id: 'name',
      user: true,
      trigger: 'name-follow-up'
    },
    {
        id: 'name-follow-up',
        message: 'Nice to meet you {previousValue}! Do you need some help?',
        trigger: 'ask-help'
    },
    {
      id: 'yes-response',
      message: "Nice to meet you {previousValue}! How can I help you?",
      trigger: 'yes-follow-up'
    },
    {
      id: 'help-no',
      message: "Alright then! If you need assistance later, feel free to ask. Goodbye!",
    },
    {
      id: 'yes-follow-up',
      options: [
        { value: 'How to use', label: 'How to use this website?', trigger: 'how-to-use' },
        { value: 'How was it build', label: 'How did you build it?', trigger: 'how' },
        { value: 'How does it work', label: 'How does it put votes on the blockchain?', trigger: 'how-work' },
        { value: 'Is vote secure', label: 'Is my vote private and secure?', trigger: 'is-vote-secure' },
        { value: 'Contact', label: 'How can I contact you?', trigger: 'contact' },
        { value: 'Fact', label: 'Share a fun blockchain fact', trigger: 'fact' },
      ],
    },
    {
      id: 'how-to-use',
      message: "All you need to do is create a simple account and then download the Metamask browser extention if you don't have it already. Voting takes place on the Sepolia Test Network and requires a small amount of Ethereum. Don't worry, you can easily obtain testing Ethereum from the Google Sepolia Faucet",
      trigger: 'anything-else'
    },
    {
      id: 'how',
      message: 'I developed this app using variety of advanced technologies. The frontend is built with Next.js, while the backend leverages NestJS. For database management, I used relational SQL database with CockroachDB as the provider. Additionally, the blockchain components utilize Web3.js and Smart Contract written by myself in the Solidity language.',
      trigger: 'anything-else'
    },
    {
      id: 'how-work',
      message: "The voting system uses the Web3.js library to interact with a Smart Contract. A Smart contract is a digital contract, usually written in the Solidity, stored on a blockchain that is automatically executed when predetermined terms and conditions are met. When you cast a vote, it is first stored in the backend and also on the Sepolia Ethereum network through the smart contract. Each vote generates a transaction hash, allowing you to verify your vote on Etherscan.",
      trigger: 'anything-else'
    },
    {
      id: 'is-vote-secure',
      message: "Yes, your vote is absolutely private and secure. Blockchain ensures security through immutability, transparency, decentralization, and cryptography. It prevents tampering and provides a transparent, verifiable record of all transactions.",
      trigger: 'anything-else'
    },
    {
      id: 'contact',
      message: 'You can reach out to me through email at nikolla.uzunov@gmail.com or at my phone number - 089 947 0320',
      trigger: 'anything-else'
    },
    {
      id: 'fact',
      message: () => {
        const randomIndex = Math.floor(Math.random() * funFacts.length);
        return funFacts[randomIndex];
      },
      trigger: 'anything-else'
    },
    {
      id: 'anything-else',
      message: 'Is there anything else I can help you with?',
      trigger: 'more-help'
    },
    {
      id: 'more-help',
      options: [
        { value: 'Yes', label: 'Yes', trigger: 'yes-follow-up' },
        { value: 'No', label: 'No', trigger: 'help-no' },
      ]
    }
  ];
  
  export default instructions;
  