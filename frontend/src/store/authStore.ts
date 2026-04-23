import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens } from '@/types';
import { authApi } from '@/api/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthTokens['player'] | null;
  /** Alias para compatibilidad con componentes que esperan `player`. */
  player: AuthTokens['player'] | null;
  refreshToken: string | null;
  setAuth: (payload: AuthTokens | AuthTokens['player'] | null) => void;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

const safeLocalStorage = {
  get: (key: string) =>
    typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem(key)
      : null,
  set: (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },
  remove: (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: !!safeLocalStorage.get('accessToken'),
      user: null,
      player: null,
      refreshToken: null,

      setAuth: (payload) => {
        if (!payload) {
          set({ isAuthenticated: false, user: null, player: null, refreshToken: null });
          return;
        }

        const looksLikeTokens =
          typeof payload === 'object' &&
          'accessToken' in payload &&
          'refreshToken' in payload &&
          'player' in payload;

        if (looksLikeTokens) {
          const tokens = payload as AuthTokens;
          safeLocalStorage.set('accessToken', tokens.accessToken);
          if (tokens.refreshToken) {
            safeLocalStorage.set('refreshToken', tokens.refreshToken);
          }
          set({
            isAuthenticated: true,
            user: tokens.player,
            player: tokens.player,
            refreshToken: tokens.refreshToken,
          });
          return;
        }

        // Compat: si solo recibimos el jugador
        const p = payload as AuthTokens['player'];
        set({ isAuthenticated: true, user: p, player: p });
      },

      logout: async () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        try {
          if (refreshToken) await authApi.logout(refreshToken);
        } catch {
          // Si falla el backend, igual limpiamos sesión local
        } finally {
          safeLocalStorage.remove('accessToken');
          safeLocalStorage.remove('refreshToken');
          set({ isAuthenticated: false, user: null, player: null, refreshToken: null });
        }
      },

      clearAuth: () => {
        safeLocalStorage.remove('accessToken');
        safeLocalStorage.remove('refreshToken');
        set({ isAuthenticated: false, user: null, player: null, refreshToken: null });
      },
    }),
    { name: 'auth-storage' }
  )
);
