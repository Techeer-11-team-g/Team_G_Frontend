import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types/api';

interface UserState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  userImageUrl: string | null;
  setUser: (user: UserProfile) => void;
  setUserImageUrl: (url: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      userImageUrl: null,
      setUser: (user) => set({ user, isLoggedIn: true }),
      setUserImageUrl: (url) => set({ userImageUrl: url }),
      clearUser: () => set({ user: null, isLoggedIn: false, userImageUrl: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
