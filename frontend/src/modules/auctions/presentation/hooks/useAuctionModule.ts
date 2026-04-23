// ══════════════════════════════════════════════════════════════
//  PRESENTATION — useAuctionModule hook
//  Adaptador de entrada. Componentes solo usan este hook.
// ══════════════════════════════════════════════════════════════

import { useEffect, useMemo } from 'react';
import { useAuctionStore } from '../../infrastructure/store/auctionStore';
import { AuctionDomainService } from '../../domain/services/AuctionDomainService';
import { useAuthStore } from '@/store/authStore';

export function useAuctionModule() {
  const { auctions, loading, error, filter, fetchAll, setFilter, placeBid, setSelected, clearError } = useAuctionStore();
  const player = useAuthStore(s => s.player);

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return auctions;
    return auctions.filter(a => a.status === filter);
  }, [auctions, filter]);

  return {
    auctions: filtered,
    allAuctions: auctions,
    loading, error, filter,
    setFilter,
    setSelected,
    clearError,
    placeBid,
    player,
    computeMinBid: AuctionDomainService.computeMinBid.bind(AuctionDomainService),
    isExpired:     AuctionDomainService.isExpired.bind(AuctionDomainService),
  };
}
