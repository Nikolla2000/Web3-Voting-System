import { Role } from 'apps/identity/src/generated/prisma/enums';

export interface UserPayload {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  role: Role;
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: Role;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}
