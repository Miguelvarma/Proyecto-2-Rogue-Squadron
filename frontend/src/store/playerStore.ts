import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PublicPlayer } from '@/types';
import { playersApi } from '@/api/players';

export interface PlayerState {
  profile: PublicPlayer | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: PublicPlayer | null) => void;
  refresh: () => Promise<void>;
  clear: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile }),

      refresh: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await playersApi.getMe();
          set({ profile: res.data.data, isLoading: false });
        } catch (err: any) {
          // Si el backend no está disponible, no rompemos la UI.
          set({
            isLoading: false,
            error: err?.message ?? 'No se pudo cargar el perfil',
          });
        }
      },

      clear: () => set({ profile: null, isLoading: false, error: null }),
    }),
    { name: 'player-storage' }
  )
);

