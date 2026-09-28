import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/auth';
import type { UserProfile } from '@/types/user';

export async function fetchProfile(): Promise<UserProfile> {
  const res = await apiClient.get<ApiResponse<UserProfile>>('/users/me');
  return res.data.data;
}

export interface UpdateProfilePayload {
  username: string;
  email: string;
  avatar?: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const res = await apiClient.patch<ApiResponse<UserProfile>>('/users/me', payload);
  return res.data.data;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.patch('/users/me/password', payload);
}

export interface DeactivateAccountPayload {
  password?: string;
}

export async function deactivateAccount(payload: DeactivateAccountPayload): Promise<void> {
  await apiClient.delete('/users/me', { data: payload });
}
