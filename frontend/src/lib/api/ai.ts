import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/auth';

export interface DuplicatePollMatch {
  pollId: string;
  title: string;
  similarity: number;
}

interface CheckDuplicatePollResponse {
  matches: DuplicatePollMatch[];
}

export async function checkDuplicatePoll(title: string, description: string): Promise<DuplicatePollMatch[]> {
  const res = await apiClient.post<ApiResponse<CheckDuplicatePollResponse>>('/polls/duplicate-check', {
    title,
    description,
  });
  return res.data.data.matches;
}

export interface PollSearchResult {
  pollId: string;
  similarity: number;
}

interface SearchPollsResponse {
  results: PollSearchResult[];
}

export async function searchPolls(query: string): Promise<PollSearchResult[]> {
  const res = await apiClient.post<ApiResponse<SearchPollsResponse>>('/polls/search', { query });
  return res.data.data.results;
}

export interface NeutralityIssue {
  text: string;
  explanation: string;
  suggestion: string;
}

interface CheckPollNeutralityResponse {
  isNeutral: boolean;
  issues: NeutralityIssue[];
}

export async function checkPollNeutrality(title: string, options: string[]): Promise<CheckPollNeutralityResponse> {
  const res = await apiClient.post<ApiResponse<CheckPollNeutralityResponse>>('/polls/neutrality-check', {
    title,
    options,
  });
  return res.data.data;
}
