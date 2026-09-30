import axios from 'axios';
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

export interface RequestAvatarUploadPayload {
  contentType: string;
  size: number;
}

export interface AvatarUploadTarget {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export async function requestAvatarUploadUrl(
  payload: RequestAvatarUploadPayload,
): Promise<AvatarUploadTarget> {
  const res = await apiClient.post<ApiResponse<AvatarUploadTarget>>('/users/me/avatar/upload-url', payload);
  return res.data.data;
}

// Uploads straight to R2, bypassing apiClient — this is a different origin
// and must not carry our Authorization header or trigger the 401/refresh interceptor.
export async function uploadAvatarFile(uploadUrl: string, file: File): Promise<void> {
  await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });
}

export async function confirmAvatar(key: string): Promise<UserProfile> {
  const res = await apiClient.patch<ApiResponse<UserProfile>>('/users/me/avatar', { key });
  return res.data.data;
}

export async function deleteAvatar(): Promise<UserProfile> {
  const res = await apiClient.delete<ApiResponse<UserProfile>>('/users/me/avatar');
  return res.data.data;
}
