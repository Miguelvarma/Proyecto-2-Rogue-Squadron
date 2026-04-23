// ══════════════════════════════════════════════════════════════
//  DOMAIN — AuctionDomainService
//  Reglas de negocio puras. Extraídas del .tsx original.
// ══════════════════════════════════════════════════════════════

import type { AuctionEntity } from '../entities/Auction';

export const AuctionDomainService = {
  validateBid(
    auction: AuctionEntity,
    amount: number,
    userTokenBalance: number
  ): { valid: boolean; error: string | null } {
    if (auction.status !== 'ACTIVE')
      return { valid: false, error: 'La subasta no está activa.' };
    if (new Date(auction.endsAt) < new Date())
      return { valid: false, error: 'La subasta ha expirado.' };
    const minBid = this.computeMinBid(auction);
    if (amount < minBid)
      return { valid: false, error: `La puja mínima es ✦ ${minBid.toLocaleString()} tokens.` };
    if (userTokenBalance < amount)
      return { valid: false, error: `Saldo insuficiente. Tienes ✦ ${userTokenBalance.toLocaleString()} tokens.` };
    return { valid: true, error: null };
  },

  computeMinBid(auction: AuctionEntity): number {
    return auction.currentPrice + auction.minIncrement;
  },

  isExpired(auction: AuctionEntity): boolean {
    return new Date(auction.endsAt) < new Date();
  },
};
