import { defineConfig } from 'hardhat/config';
import hardhatToolboxViem from '@nomicfoundation/hardhat-toolbox-viem';
import 'dotenv/config';

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL ?? '';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';

export default defineConfig({
  plugins: [hardhatToolboxViem],
  solidity: {
    version: '0.8.23',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
    // Hardhat only writes by-name artifacts (what Ignition deploys by) for
    // this project's own contracts/ sources by default — these npm-sourced
    // dependencies need to be listed explicitly to get the same treatment.
    npmFilesToBuild: [
      '@semaphore-protocol/contracts/Semaphore.sol',
      '@semaphore-protocol/contracts/base/SemaphoreVerifier.sol',
      'poseidon-solidity/PoseidonT3.sol',
    ],
  },
  networks: {
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: SEPOLIA_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY ?? '',
    },
  },
});
