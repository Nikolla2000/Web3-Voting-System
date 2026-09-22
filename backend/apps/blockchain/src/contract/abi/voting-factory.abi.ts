import { parseAbi } from 'viem';

/**
 * PLACEHOLDER — contracts/ hasn't been written yet (see roadmap). This is
 * the interface ContractService expects from a single, already-deployed
 * factory: given a pollId (a Semaphore field element, see uuidToFieldElement)
 * it deploys a dedicated poll contract and returns its address.
 *
 * Swap the value for the real compiled ABI once contracts/ exists — nothing
 * in ContractService should need to change if the function/event names match.
 */
export const votingFactoryAbi = parseAbi([
  'function createPoll(uint256 pollId, uint256 merkleTreeDepth) external returns (address pollContract)',
  'event PollCreated(uint256 indexed pollId, address pollContract)',
]);
