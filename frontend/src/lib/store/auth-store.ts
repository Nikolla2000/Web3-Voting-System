import { create } from 'zustand';
import {
  fetchMe,
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
  type AuthUser,
} from '@/lib/api/auth';
import type { LoginFormValues, RegisterFormValues } from '@/lib/validation/auth-schemas';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  bootstrap: () => Promise<void>;
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: Omit<RegisterFormValues, 'confirmPassword'>) => Promise<void>;
  logout: () => Promise<void>;
  handleSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'idle',

  bootstrap: async () => {
    set({ status: 'loading' });
    try {
      const accessToken = await refreshRequest();
      set({ accessToken });
      const user = await fetchMe();
      set({ user, status: 'authenticated' });
    } catch {
      set({ user: null, accessToken: null, status: 'unauthenticated' });
    }
  },

  login: async (values) => {
    const data = await loginRequest(values);
    set({ user: data.user, accessToken: data.accessToken, status: 'authenticated' });
  },

  register: async (values) => {
    const user = await registerRequest(values);
    set({ user, status: 'authenticated' });
  },

  logout: async () => {
    await logoutRequest();
    set({ user: null, status: 'unauthenticated', accessToken: null });
  },

  // Called by the axios interceptor when a refresh attempt fails
  handleSessionExpired: async () => {
    set({ user: null, accessToken: null, status: 'unauthenticated' });
    if (typeof window !== 'undefined') {
      window.location.assign('/sign-in')
    }
  },
}));