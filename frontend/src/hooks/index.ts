import { useState, useEffect, useCallback } from 'react';
import { auctionsApi } from '@/api/auctions';
import { missionsApi } from '@/api/missions';
import { playersApi } from '@/api/players';
import { Auction, Mission, InventoryItem, PublicPlayer } from '@/types';

// ── Generic fetch hook
function useFetch<T>(fetcher: () => Promise<{ data: { data: T } }>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetcher();
      setData(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ── Specific hooks
export const useAuctions = () => useFetch<Auction[]>(() => auctionsApi.getAll());
export const useAuction = (id: string) => useFetch<Auction>(() => auctionsApi.getById(id));
export const useActiveMissions = () => useFetch<Mission[]>(() => missionsApi.getActive());
export const useMyInventory = () => useFetch<InventoryItem[]>(() => playersApi.getMyInventory());
export const useRankings = () => useFetch<PublicPlayer[]>(() => playersApi.getRankings());
export const useMyProfile = () => useFetch<PublicPlayer>(() => playersApi.getMe());
