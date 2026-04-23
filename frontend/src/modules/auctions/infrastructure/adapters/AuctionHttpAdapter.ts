// ══════════════════════════════════════════════════════════════
//  INFRASTRUCTURE — AuctionAdapter
//  Implementa IAuctionRepository usando el apiClient real.
//  Cuando el backend devuelve 501/error, cae al mock del .tsx.
// ══════════════════════════════════════════════════════════════

import { auctionsApi } from '@/api/auctions';
import type { IAuctionRepository } from '../../domain/ports/IAuctionRepository';
import type { AuctionEntity, Bid, InventorySnapshot } from '../../domain/entities/Auction';
import type { Auction as ApiAuction, ItemRarity } from '@/types';

// ── Mock fallback (del .tsx original) ────────────────────────
const now = Date.now();

function mockSnapshot(itemId: string, name: string, rarity: ItemRarity): InventorySnapshot {
  const descMap: Record<string, string> = {
    'item-1': 'Forjada en las fraguas del sol naciente. Brilla con luz divina en la oscuridad del Nexus.',
    'item-2': 'Tejido con hilos de estrellas caídas. Otorga visión más allá del velo arcano.',
    'item-3': 'Escudo de escarcha élfica. Absorbe el calor de cualquier llama.',
    'item-4': 'Daga forjada en sombras. Su filo corta entre mundos.',
  };
  const statsMap: Record<string, Record<string, number>> = {
    'item-1': { attack: 95, critChance: 35, magic: 20 },
    'item-2': { defense: 80, magic: 60, agility: 25 },
    'item-3': { defense: 70, critChance: 5 },
    'item-4': { attack: 65, agility: 45, critChance: 40 },
  };
  return {
    itemId,
    name,
    description: descMap[itemId] ?? '',
    rarity,
    type: ['item-1', 'item-4'].includes(itemId) ? 'WEAPON' : 'ARMOR',
    stats: statsMap[itemId] ?? {},
  };
}

let _mockStore: AuctionEntity[] = [
  {
    id: 'auction-1',
    itemSnapshot: mockSnapshot('item-1', 'Espada del Alba Eterna', 'LEGENDARY'),
    startingPrice: 800, currentPrice: 800, minIncrement: 50,
    endsAt: new Date(now + 2.5 * 3600000).toISOString(),
    createdAt: new Date(now - 3600000).toISOString(),
    status: 'ACTIVE', sellerId: 'admin',
    currentWinnerId: 'player-x', currentWinnerName: 'Aldric',
    bids: [{ id: 'b-0', auctionId: 'auction-1', bidderId: 'player-x', bidderUsername: 'Aldric', amount: 800, placedAt: new Date(now - 1800000).toISOString() }],
  },
  {
    id: 'auction-2',
    itemSnapshot: mockSnapshot('item-2', 'Manto de las Estrellas', 'EPIC'),
    startingPrice: 350, currentPrice: 420, minIncrement: 20,
    endsAt: new Date(now + 3600000).toISOString(),
    createdAt: new Date(now - 5400000).toISOString(),
    status: 'ACTIVE', sellerId: 'admin',
    currentWinnerId: 'player-z', currentWinnerName: 'Valdris',
    bids: [
      { id: 'b-1', auctionId: 'auction-2', bidderId: 'player-y', bidderUsername: 'Seraphine', amount: 350, placedAt: new Date(now - 5400000).toISOString() },
      { id: 'b-2', auctionId: 'auction-2', bidderId: 'player-z', bidderUsername: 'Valdris',   amount: 420, placedAt: new Date(now - 1200000).toISOString() },
    ],
  },
  {
    id: 'auction-3',
    itemSnapshot: mockSnapshot('item-3', 'Escudo de Escarcha Antigua', 'RARE'),
    startingPrice: 200, currentPrice: 200, minIncrement: 10,
    endsAt: new Date(now + 4 * 3600000).toISOString(),
    createdAt: new Date(now - 3600000).toISOString(),
    status: 'ACTIVE', sellerId: 'admin',
    currentWinnerId: null, currentWinnerName: null, bids: [],
  },
  {
    id: 'auction-4',
    itemSnapshot: mockSnapshot('item-4', 'Daga Sombría', 'EPIC'),
    startingPrice: 600, currentPrice: 750, minIncrement: 25,
    endsAt: new Date(now - 1800000).toISOString(),
    createdAt: new Date(now - 10800000).toISOString(),
    status: 'CLOSED', sellerId: 'admin',
    currentWinnerId: 'player-x', currentWinnerName: 'Aldric',
    bids: [
      { id: 'b-3', auctionId: 'auction-4', bidderId: 'player-y', bidderUsername: 'Seraphine', amount: 600, placedAt: new Date(now - 10800000).toISOString() },
      { id: 'b-4', auctionId: 'auction-4', bidderId: 'player-x', bidderUsername: 'Aldric',    amount: 750, placedAt: new Date(now - 7200000).toISOString() },
    ],
  },
];

// ── Mapper: ApiAuction → AuctionEntity ───────────────────────
function mapApiToEntity(a: ApiAuction): AuctionEntity {
  return {
    id: a.id,
    itemSnapshot: {
      itemId:      a.itemId,
      name:        a.itemName,
      description: '',
      rarity:      a.rarity,
      type:        'WEAPON',
      stats:       {},
    },
    startingPrice:     a.startingPrice,
    currentPrice:      a.currentPrice,
    minIncrement:      Math.max(1, Math.floor(a.currentPrice * 0.05)),
    currentWinnerId:   a.currentWinnerId,
    currentWinnerName: null,
    status:            a.status,
    endsAt:            a.endsAt,
    createdAt:         a.createdAt,
    bids:              (a.bids ?? []).map(b => ({
      id:             b.id,
      auctionId:      b.auctionId,
      bidderId:       b.bidderId,
      bidderUsername: b.bidderId,
      amount:         b.amount,
      placedAt:       b.placedAt,
    })),
    sellerId: 'admin',
  };
}

export class AuctionHttpAdapter implements IAuctionRepository {
  async getAll(): Promise<AuctionEntity[]> {
    try {
      const res = await auctionsApi.getAll({ limit: 50, offset: 0 });
      const data = res.data?.data ?? [];
      if (!Array.isArray(data) || data.length === 0) return [..._mockStore];
      return data.map(mapApiToEntity);
    } catch {
      return [..._mockStore];
    }
  }

  async getById(id: string): Promise<AuctionEntity> {
    try {
      const res = await auctionsApi.getById(id);
      return mapApiToEntity(res.data.data);
    } catch {
      const found = _mockStore.find(a => a.id === id);
      if (!found) throw new Error('Subasta no encontrada.');
      return { ...found, bids: [...found.bids] };
    }
  }

  async placeBid(auctionId: string, bid: Bid): Promise<AuctionEntity> {
    try {
      const res = await auctionsApi.placeBid(auctionId, bid.amount);
      return mapApiToEntity(res.data.data);
    } catch {
      // Mock fallback: actualizar en memoria
      await new Promise(r => setTimeout(r, 400));
      const idx = _mockStore.findIndex(a => a.id === auctionId);
      if (idx === -1) throw new Error('Subasta no encontrada.');
      const auction = { ..._mockStore[idx] };
      auction.bids = [bid, ...auction.bids];
      auction.currentPrice      = bid.amount;
      auction.currentWinnerId   = bid.bidderId;
      auction.currentWinnerName = bid.bidderUsername;
      _mockStore[idx] = auction;
      return { ...auction };
    }
  }
}
