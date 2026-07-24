import { create } from 'zustand';
import {
  fetchSession,
  loginRequest,
  logoutRequest,
  registerRequest,
  type AuthUser,
} from '@/lib/api/auth';
import type { LoginFormValues, RegisterFormValues } from '@/lib/validation/auth-schemas';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  bootstrap: () => Promise<void>;
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: Omit<RegisterFormValues, 'confirmPassword'>) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  bootstrap: async () => {
    set({ status: 'loading' });
    const user = await fetchSession();
    set({ user, status: user ? 'authenticated' : 'unauthenticated' });
  },

  login: async (values) => {
    const user = await loginRequest(values);
    set({ user: user, status: 'authenticated' });
  },

  register: async (values) => {
    const user = await registerRequest(values);
    set({ user, status: 'authenticated' });
  },

  logout: async () => {
    await logoutRequest();
    set({ user: null, status: 'unauthenticated' });
  },
}));