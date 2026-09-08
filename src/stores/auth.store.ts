import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthSession, AuthUser } from "@/features/auth/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresIn: number | null;
  refreshTokenExpiresIn: number | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  setSession: (session: AuthSession) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresIn: null,
      refreshTokenExpiresIn: null,
      isAuthenticated: false,
      hasHydrated: false,

      setSession: (session) => set({ ...session, isAuthenticated: true }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresIn: null,
          refreshTokenExpiresIn: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "ems-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
