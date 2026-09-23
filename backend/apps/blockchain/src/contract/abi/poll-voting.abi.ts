import { parseAbi } from 'viem';

/**
 * Matches contracts/contracts/PollVoting.sol — one deployed instance shared
 * across every poll (not per-poll like the earlier placeholder assumed).
 * PollVoting wraps the canonical Semaphore contract: each poll gets its own
 * Semaphore group, but there's only one contract address to track, set once
 * in POLL_VOTING_CONTRACT_ADDRESS.
 *
 * createPoll/addMember are onlyOwner on-chain — the deployed owner must be
 * this service's RELAYER_PRIVATE_KEY-derived address, or every write here
 * will revert.
 */
export const pollVotingAbi = parseAbi([
  'function createPoll(uint256 pollId) external returns (uint256 groupId)',
  'function addMember(uint256 pollId, uint256 identityCommitment) external',
  'function castVote(uint256 pollId, (uint256 merkleTreeDepth, uint256 merkleTreeRoot, uint256 nullifier, uint256 message, uint256 scope, uint256[8] points) proof) external',
  'event PollCreated(uint256 indexed pollId, uint256 groupId)',
  'event VoteCast(uint256 indexed pollId, uint256 message, uint256 nullifier)',
]);
