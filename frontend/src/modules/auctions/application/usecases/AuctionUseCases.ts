// ══════════════════════════════════════════════════════════════
//  APPLICATION — Auction Use Cases
//  Orquestan dominio + adaptadores. Sin dependencias de React.
// ══════════════════════════════════════════════════════════════

import { AuctionDomainService } from '../../domain/services/AuctionDomainService';
import { createBid } from '../../domain/entities/Auction';
import type { IAuctionRepository } from '../../domain/ports/IAuctionRepository';
import type { AuctionEntity, Bid } from '../../domain/entities/Auction';

export class AuctionUseCases {
  constructor(private readonly repo: IAuctionRepository) {}

  async getAll(): Promise<AuctionEntity[]> {
    return this.repo.getAll();
  }

  async getById(id: string): Promise<AuctionEntity> {
    return this.repo.getById(id);
  }

  async placeBid(params: {
    auctionId: string;
    amount:    number;
    player:    { id: string; username: string; tokenBalance: number };
  }): Promise<{ auction: AuctionEntity; bid: Bid }> {
    const auction = await this.repo.getById(params.auctionId);

    const validation = AuctionDomainService.validateBid(
      auction,
      params.amount,
      params.player.tokenBalance
    );
    if (!validation.valid) throw new Error(validation.error!);

    const bid = createBid(
      `bid-${Date.now()}`,
      params.auctionId,
      params.player.id,
      params.player.username,
      params.amount,
      new Date().toISOString()
    );

    const updated = await this.repo.placeBid(params.auctionId, bid);
    return { auction: updated, bid };
  }
}
