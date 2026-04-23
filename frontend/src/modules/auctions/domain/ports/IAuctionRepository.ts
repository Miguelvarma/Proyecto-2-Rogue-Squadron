// ══════════════════════════════════════════════════════════════
//  DOMAIN — Port (Contrato de salida)
// ══════════════════════════════════════════════════════════════

import type { AuctionEntity, Bid } from '../entities/Auction';

export interface IAuctionRepository {
  getAll(): Promise<AuctionEntity[]>;
  getById(id: string): Promise<AuctionEntity>;
  placeBid(auctionId: string, bid: Bid): Promise<AuctionEntity>;
}
