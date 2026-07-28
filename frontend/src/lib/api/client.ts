import axios from 'axios';
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

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

function flushQueue(error: unknown | null) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
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

    if (isRefreshing) {
      //safe from race condition
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: () => resolve(apiClient(originalRequest)),
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh');
      useAuthStore.setState({ accessToken: data.accessToken });
      isRefreshing = false;
      flushQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      flushQueue(refreshError);
      // Refresh token is also invalid or expired
      useAuthStore.getState().handleSessionExpired();
      return Promise.reject(refreshError);
    }
  },
);