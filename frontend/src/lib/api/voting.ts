import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/auth';

interface JoinGroupResponse {
  root: string;
  index: number;
}

export async function joinGroup(pollId: string, identityCommitment: string): Promise<JoinGroupResponse> {
  const res = await apiClient.post<ApiResponse<JoinGroupResponse>>(`/polls/${pollId}/group/join`, {
    identityCommitment,
  });
  return res.data.data;
}

export interface MerkleProofResponse {
  root: string;
  index: number;
  siblings: string[];
}

export async function getMerkleProof(pollId: string, identityCommitment: string): Promise<MerkleProofResponse> {
  const res = await apiClient.get<ApiResponse<MerkleProofResponse>>(`/polls/${pollId}/group/merkle-proof`, {
    params: { identityCommitment },
  });
  return res.data.data;
}

export interface VoteProofPayload {
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  nullifier: string;
  message: string;
  scope: string;
  points: string[];
}

interface SubmitVoteResponse {
  transactionHash: string;
}

export async function submitVote(pollId: string, proof: VoteProofPayload): Promise<SubmitVoteResponse> {
  const res = await apiClient.post<ApiResponse<SubmitVoteResponse>>(`/polls/${pollId}/vote`, proof);
  return res.data.data;
}
