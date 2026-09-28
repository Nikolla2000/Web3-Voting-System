export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}
