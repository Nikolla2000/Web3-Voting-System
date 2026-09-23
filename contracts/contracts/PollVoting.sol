// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ISemaphore} from "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title PollVoting
/// @notice Thin wrapper around the canonical Semaphore contract: one Semaphore
/// group per poll. Group admission (createPoll/addMember) is restricted to
/// the backend relayer — this project's off-chain Sybil-resistance check
/// (one identity commitment per user per poll, see
/// apps/blockchain/src/semaphore/semaphore.service.ts) runs before addMember
/// is ever called, so this contract doesn't re-implement that check, only
/// enforces that nothing else can bypass it by calling addMember directly.
/// Votes (castVote) are unrestricted — the zero-knowledge proof is what
/// authorizes a vote, not the caller, matching Semaphore's own
/// validateProof being public.
contract PollVoting is Ownable {
    ISemaphore public immutable semaphore;

    mapping(uint256 pollId => uint256 groupId) public pollGroupId;
    mapping(uint256 pollId => bool exists) public pollExists;

    event PollCreated(uint256 indexed pollId, uint256 groupId);
    event VoteCast(uint256 indexed pollId, uint256 message, uint256 nullifier);

    error PollAlreadyExists(uint256 pollId);
    error PollDoesNotExist(uint256 pollId);

    constructor(ISemaphore _semaphore, address _relayer) Ownable(_relayer) {
        semaphore = _semaphore;
    }

    /// @dev Called once per poll, by the relayer, after polls publishes poll.created.
    function createPoll(uint256 pollId) external onlyOwner returns (uint256 groupId) {
        if (pollExists[pollId]) revert PollAlreadyExists(pollId);

        groupId = semaphore.createGroup(address(this));
        pollGroupId[pollId] = groupId;
        pollExists[pollId] = true;

        emit PollCreated(pollId, groupId);
    }

    /// @dev Called by the relayer once a voter has passed the off-chain Sybil check.
    function addMember(uint256 pollId, uint256 identityCommitment) external onlyOwner {
        if (!pollExists[pollId]) revert PollDoesNotExist(pollId);

        semaphore.addMember(pollGroupId[pollId], identityCommitment);
    }

    /// @dev Reverts via Semaphore's own checks if the proof, root, or nullifier is invalid.
    function castVote(uint256 pollId, ISemaphore.SemaphoreProof calldata proof) external {
        if (!pollExists[pollId]) revert PollDoesNotExist(pollId);

        semaphore.validateProof(pollGroupId[pollId], proof);

        emit VoteCast(pollId, proof.message, proof.nullifier);
    }
}
