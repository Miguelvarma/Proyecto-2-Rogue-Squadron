// ══════════════════════════════════════════════════════════════
//  Módulo de Subastas — Public API
// ══════════════════════════════════════════════════════════════
export { AuctionsModule } from './presentation/components/AuctionsModule';
export { useAuctionModule } from './presentation/hooks/useAuctionModule';
export { useAuctionStore } from './infrastructure/store/auctionStore';
export type { AuctionEntity, Bid } from './domain/entities/Auction';
