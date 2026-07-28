import { apiClient } from '@/lib/api/client';
import type { LoginFormValues, RegisterFormValues } from '@/lib/validation/auth-schemas';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  success: boolean;
  timestamp: string;
}

export interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
}

type RegisterPayload = Omit<RegisterFormValues, 'confirmPassword'>;

export async function loginRequest(payload: LoginFormValues): Promise<AuthUser> {
  const { data } = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
  return data.data.user;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>('/auth/register', payload);
  return data;
}

// Uses httpOnly cookie
export async function refreshRequest(): Promise<string> {
  const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
  console.log(data);
  return data.data.accessToken; 
}
 
export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function fetchSession(): Promise<AuthUser | null> {
  try {
    const { data } = await apiClient.get<AuthUser>('/users/me');
    return data;
  } catch {
    return null;
  }
}