import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminChatbotApi } from '@/api/adminChatbot';

interface AdminChatbotState {
  isAuthenticated: boolean;
  username: string | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAdminChatbotStore = create<AdminChatbotState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await adminChatbotApi.login(username, password);
          localStorage.setItem('adminChatbotSessionToken', result.token);
          set({
            isAuthenticated: true,
            username: result.username,
            token: result.token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          localStorage.removeItem('adminChatbotSessionToken');
          set({
            isAuthenticated: false,
            username: null,
            token: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'No se pudo iniciar sesión admin.',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await adminChatbotApi.logout();
        } catch {
          // Ignoramos errores de red al cerrar sesión local.
        } finally {
          localStorage.removeItem('adminChatbotSessionToken');
          set({
            isAuthenticated: false,
            username: null,
            token: null,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'admin-chatbot-session-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        username: state.username,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const token = localStorage.getItem('adminChatbotSessionToken');
        if (token && state.token !== token) {
          state.token = token;
        }
        state.isAuthenticated = Boolean(token && state.token);
      },
    }
  )
);
