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
