import type { Poll } from '@/types/poll';
import type { UserProfile } from '@/types/user';

export function profileFixture(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'u1',
    username: 'alice',
    email: 'alice@example.com',
    avatar: null,
    role: 'USER',
    isActive: true,
    hasPassword: true,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
    ...overrides,
  };
}

export function pollFixture(overrides: Partial<Poll> = {}): Poll {
  return {
    id: 'poll-1',
    title: 'Best city for a weekend trip?',
    description: 'Pick the city you would most like to visit.',
    imageUrl: 'https://cdn.example/cover.png',
    category: 'travel',
    startsAt: '2026-05-30T12:00:00.000Z',
    endsAt: '2026-06-04T12:00:00.000Z',
    contractAddress: '0xabc',
    options: [
      { id: 'o1', label: 'Lisbon', votes: 10 },
      { id: 'o2', label: 'Prague', votes: 5 },
    ],
    ...overrides,
  };
}
