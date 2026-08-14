export type PollStatus = 'upcoming' | 'active' | 'ended';

export type PollCategory = 'governance' | 'treasury' | 'technical' | 'community';

export type PollSortOption = 'newest' | 'endingSoon' | 'mostVotes' | 'alphabetical';

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: PollCategory;
  startsAt: string;
  endsAt: string;
  contractAddress: string; //ellection contract address in Sepolia
  options: PollOption[];
}