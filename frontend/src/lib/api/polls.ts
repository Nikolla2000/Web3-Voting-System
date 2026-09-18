import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/auth';
import type { Poll, PollCategory } from '@/types/poll';

interface PollOptionResponse {
  id: string;
  label: string;
  votes: number;
}

interface PollResponse {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  startsAt: string;
  endsAt: string;
  contractAddress: string | null;
  creatorId: string;
  totalVotes: number;
  options: PollOptionResponse[];
}

interface PollsListResponse {
  items: PollResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface PollsQueryParams {
  search?: string;
  status?: 'all' | 'active' | 'upcoming' | 'ended';
  sortBy?: 'newest' | 'endingSoon' | 'mostVotes' | 'alphabetical';
  page?: number;
  limit?: number;
}

function mapPollResponse(raw: PollResponse): Poll {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    imageUrl: raw.imageUrl,
    category: raw.category.toLowerCase() as PollCategory,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
    contractAddress: raw.contractAddress ?? '',
    options: raw.options.map((option) => ({
      id: option.id,
      label: option.label,
      votes: option.votes,
    })),
  };
}

export async function fetchPolls(params: PollsQueryParams = {}): Promise<{ items: Poll[]; total: number }> {
  const res = await apiClient.get<ApiResponse<PollsListResponse>>('/polls', { params });
  return {
    items: res.data.data.items.map(mapPollResponse),
    total: res.data.data.total,
  };
}

export async function fetchPollById(id: string): Promise<Poll> {
  const res = await apiClient.get<ApiResponse<PollResponse>>(`/polls/${id}`);
  return mapPollResponse(res.data.data);
}
