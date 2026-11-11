import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/api';
import { AUTH_TOKEN_KEY } from '@/api/client';
import { getOwnProfile } from '@/api/auth';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isHydrating: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setHydrating: (val: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isHydrating: true,

      setAuth: (user, token) => {
        try {
          localStorage.setItem(AUTH_TOKEN_KEY, token);
        } catch {
          // Ignore storage restrictions
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
          isHydrating: false,
        });
      },

      setUser: (user) => {
        set({
          user,
          isAdmin: user.role === 'ADMIN',
        });
      },

      clearAuth: () => {
        try {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        } catch {
          // Ignore storage restrictions
        }
        // Cart decision: Keep client cart on logout!
        // As defined in AGENT_CONTEXT section 7, the cart is client-side only demonstration
        // ordering. Retaining items prevents frustrating users when re-authenticating or switching accounts.
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isHydrating: false,
        });
      },

      setHydrating: (val) => set({ isHydrating: val }),

      initialize: async () => {
        const currentToken = get().token || localStorage.getItem(AUTH_TOKEN_KEY);

        if (!currentToken) {
          set({ isHydrating: false });
          return;
        }

        try {
          set({ isHydrating: true });
          const user = await getOwnProfile();
          set({
            user,
            token: currentToken,
            isAuthenticated: true,
            isAdmin: user.role === 'ADMIN',
            isHydrating: false,
          });
        } catch {
          // Token is invalid, expired, or backend rejected 401
          get().clearAuth();
        }
      },
    }),
    {
      name: 'cafe_auth_storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);

export default useAuthStore;
