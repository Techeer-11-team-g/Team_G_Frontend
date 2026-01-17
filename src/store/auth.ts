import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/api';

interface AuthState {
  // 상태
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // 액션
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AuthUser) => void;
  login: (user: AuthUser, access: string, refresh: string) => void;
  logout: () => void;
  updateAccessToken: (access: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),

      setUser: (user) => set({ user }),

      login: (user, access, refresh) =>
        set({
          user,
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      updateAccessToken: (access) => set({ accessToken: access }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
