// ══════════════════════════════════════════════════════════════
//  INFRASTRUCTURE — Auction Store (Zustand)
//  Inyecta las dependencias y expone estado a la presentación.
// ══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { AuctionUseCases } from '../../application/usecases/AuctionUseCases';
import { AuctionHttpAdapter } from '../adapters/AuctionHttpAdapter';
import type { AuctionEntity, Bid } from '../../domain/entities/Auction';

// ── Wiring (IoC manual) ───────────────────────────────────────
const adapter  = new AuctionHttpAdapter();
const useCases = new AuctionUseCases(adapter);

interface AuctionState {
  auctions:     AuctionEntity[];
  selected:     AuctionEntity | null;
  loading:      boolean;
  error:        string | null;
  filter:       'ALL' | 'ACTIVE' | 'CLOSED';

  fetchAll:     () => Promise<void>;
  fetchById:    (id: string) => Promise<void>;
  placeBid:     (params: { auctionId: string; amount: number; player: { id: string; username: string; tokenBalance: number } }) => Promise<Bid>;
  setFilter:    (f: 'ALL' | 'ACTIVE' | 'CLOSED') => void;
  setSelected:  (a: AuctionEntity | null) => void;
  clearError:   () => void;
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  auctions:  [],
  selected:  null,
  loading:   false,
  error:     null,
  filter:    'ALL',

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const list = await useCases.getAll();
      set({ auctions: list });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar subastas' });
    } finally {
      set({ loading: false });
    }
  },

  fetchById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const auction = await useCases.getById(id);
      set({ selected: auction });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar subasta' });
    } finally {
      set({ loading: false });
    }
  },

  placeBid: async (params) => {
    const { auction, bid } = await useCases.placeBid(params);
    // Actualiza la lista y el seleccionado en el store
    set(s => ({
      auctions: s.auctions.map(a => a.id === auction.id ? auction : a),
      selected: auction,
    }));
    return bid;
  },

  setFilter:   (filter)   => set({ filter }),
  setSelected: (selected) => set({ selected }),
  clearError:  ()         => set({ error: null }),
}));
