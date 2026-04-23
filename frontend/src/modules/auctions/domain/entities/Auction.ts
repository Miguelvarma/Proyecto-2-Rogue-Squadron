// ══════════════════════════════════════════════════════════════
//  DOMAIN — Auction Entities
//  Extraídas del módulo monolítico remixed-f0776914.tsx.
//  Sin dependencias externas. Pura lógica de negocio.
// ══════════════════════════════════════════════════════════════

import type { ItemRarity } from '@/types';

export interface InventorySnapshot {
  itemId:      string;
  name:        string;
  description: string;
  rarity:      ItemRarity;
  type:        string;
  stats:       Record<string, number>;
}

export interface Bid {
  id:              string;
  auctionId:       string;
  bidderId:        string;
  bidderUsername:  string;
  amount:          number;
  placedAt:        string;
}

export interface AuctionEntity {
  id:                 string;
  itemSnapshot:       InventorySnapshot;
  startingPrice:      number;
  currentPrice:       number;
  minIncrement:       number;
  currentWinnerId:    string | null;
  currentWinnerName:  string | null;
  status:             'ACTIVE' | 'CLOSED' | 'CANCELLED';
  endsAt:             string;
  createdAt:          string;
  bids:               Bid[];
  sellerId:           string;
}

// ── Value Object factories ────────────────────────────────────
export const createBid = (
  id: string, auctionId: string, bidderId: string,
  bidderUsername: string, amount: number, placedAt: string
): Bid => ({ id, auctionId, bidderId, bidderUsername, amount, placedAt });
