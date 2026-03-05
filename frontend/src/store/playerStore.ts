/**
 * playerStore.ts — Estado Global del Jugador
 * Fuente única de verdad para datos de juego en tiempo real.
 * Compartido entre: Navbar (coins), Chatbot (contexto), Pagos (post-compra).
 *
 * REGLA: Este store se actualiza SIEMPRE después de:
 *   - Login exitoso
 *   - Pago completado (playerStore.refresh())
 *   - Misión completada
 *   - Puja ganada
 */
import { create } from 'zustand';
import { playersApi } from '@/api/players';
import type { PublicPlayer, InventoryItem } from '@/types';

interface PlayerState {
  profile: PublicPlayer | null;
  inventory: InventoryItem[];
  isLoading: boolean;
  lastFetched: number | null;

  fetchProfile: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  refresh: () => Promise<void>;
  setCoins: (coins: number) => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  profile: null,
  inventory: [],
  isLoading: false,
  lastFetched: null,

  fetchProfile: async () => {
    // Evitar refetch si los datos tienen menos de 30 segundos
    const now = Date.now();
    const last = get().lastFetched;
    if (last && now - last < 30_000) return;

    set({ isLoading: true });
    try {
      const { data } = await playersApi.getMe();
      set({
        profile: data.data,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchInventory: async () => {
    try {
      const { data } = await playersApi.getInventory();
      set({ inventory: data.data });
    } catch {
      // silencioso — no bloquear UI por error de inventario
    }
  },

  // Fuerza recarga: llamar después de pago completado
  refresh: async () => {
    set({ lastFetched: null });
    await get().fetchProfile();
    await get().fetchInventory();
  },

  // Actualización optimista de monedas (para animaciones de Navbar)
  setCoins: (coins: number) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, gold: coins } : null,
    })),

  clear: () => set({ profile: null, inventory: [], lastFetched: null }),
}));
