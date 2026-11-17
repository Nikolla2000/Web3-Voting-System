import axios from 'axios';
import { refreshRequest } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
  withCredentials: true, //need only for /refresh endpoint which requires httpOnly cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * One refresh-and-store per burst of 401s: concurrent failures share it, so the session is
 * expired (and the user redirected) once rather than once per failed request.
 */
let sessionRefresh: Promise<string> | null = null;

export function refreshSession(): Promise<string> {
  sessionRefresh ??= refreshRequest()
    .then(
      (accessToken) => {
        useAuthStore.setState({ accessToken });
        return accessToken;
      },
      (refreshError) => {
        // Refresh token is also invalid or expired
        useAuthStore.getState().handleSessionExpired();
        throw refreshError;
      },
    )
    .finally(() => {
      sessionRefresh = null;
    });
  return sessionRefresh;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url: string | undefined = originalRequest?.url;

    const isAuthEndpoint =
      url?.includes('/auth/login') ||
      url?.includes('/auth/register') ||
      url?.includes('/auth/refresh');

    if (error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // A late 401: the request went out with a token that has since been replaced (a refresh or a
    // login finished while it was in flight). The current token is already fresh, so just retry.
    const { accessToken } = useAuthStore.getState();
    if (accessToken && originalRequest.headers?.Authorization !== `Bearer ${accessToken}`) {
      return apiClient(originalRequest);
    }

    await refreshSession();
    return apiClient(originalRequest);
  },
);
