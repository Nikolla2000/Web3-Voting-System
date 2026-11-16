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
