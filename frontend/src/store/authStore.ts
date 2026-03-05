import { create } from 'zustand';
import { AuthTokens, PublicPlayer } from '@/types';
import { authApi } from '@/api/auth';

interface AuthState {
  player: Pick<PublicPlayer, 'id' | 'username' | 'role'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  player: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      const tokens = data.data;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      set({ player: tokens.player, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register({ username, email, password });
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Registration failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken') ?? '';
    try { await authApi.logout(refreshToken); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ player: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
