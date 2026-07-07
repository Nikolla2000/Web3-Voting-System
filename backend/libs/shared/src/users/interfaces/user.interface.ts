import { Role } from "apps/identity/src/generated/prisma/enums";

export interface UserPayload {
    id: string;
    email: string;
    username: string;
    role: Role;
}

export interface SafeUser {
    id: string;
    username: string;
    email: string;
    walletAddress: string | null;
    avatar: string | null;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}