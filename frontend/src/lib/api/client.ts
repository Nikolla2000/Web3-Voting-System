import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
  // Sends/receives the httpOnly session cookie set by the identity-service.
  // The frontend never reads or stores the token itself.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized place to react to an expired/invalid session.
    // The auth store's `bootstrap`/`logout` handle clearing local state;
    // this is where you'd add a redirect-to-login side effect later if needed.
    if (error.response?.status === 401) {
      // no-op for now — callers already handle the rejected promise
    }
    return Promise.reject(error);
  },
);