import { apiClient } from './client';
import { Auction, ApiResponse } from '@/types';

export const auctionsApi = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<ApiResponse<Auction[]>>('/auctions', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Auction>>(`/auctions/${id}`),

  placeBid: (auctionId: string, amount: number) =>
    apiClient.post<ApiResponse<Auction>>(`/auctions/${auctionId}/bids`, { amount }),
};
