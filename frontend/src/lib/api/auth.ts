import { apiClient } from '@/lib/api/client';
import type { LoginFormValues, RegisterFormValues } from '@/lib/validation/auth-schemas';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
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

export async function loginRequest(payload: LoginFormValues): Promise<AuthResponseData> {
  const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
  return res.data.data;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponseData> {
  const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
  return res.data.data;
}

let inFlightRefresh: Promise<string> | null = null;

/**
 * Exchanges the httpOnly refresh cookie for a new access token.
 *
 * Single-flight: the backend rotates the refresh token on every use, so two concurrent refreshes
 * would send the same cookie twice and the loser would 401, signing the user out. Bootstrap (run
 * twice by StrictMode in dev) and the client's 401 interceptor can both fire at page load, so every
 * caller joins the refresh already in flight instead of starting a second one.
 */
export function refreshRequest(): Promise<string> {
  inFlightRefresh ??= apiClient
    .post<ApiResponse<{ accessToken: string }>>('/auth/refresh')
    .then(({ data }) => data.data.accessToken)
    .finally(() => {
      inFlightRefresh = null;
    });
  return inFlightRefresh;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function logoutAllRequest(): Promise<void> {
  await apiClient.post('/auth/logout-all');
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await apiClient.get<ApiResponse<AuthUser>>('/users/me');
  return res.data.data;
}
