import { parseAbi } from 'viem';

/**
 * PLACEHOLDER — see voting-factory.abi.ts. Every poll contract deployed by
 * the factory is expected to share this exact ABI, which is what lets
 * ContractService.watchVoteCastEvents() watch VoteCast across every poll
 * with a single subscription instead of tracking each poll's address.
 */
export const pollAbi = parseAbi([
  'function castVote(uint256 merkleTreeRoot, uint256 nullifier, uint256 message, uint256 scope, uint256[8] points) external',
  'event VoteCast(uint256 indexed pollId, uint256 message, uint256 nullifier)',
]);
