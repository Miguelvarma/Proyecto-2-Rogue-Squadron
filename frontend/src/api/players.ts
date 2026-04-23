import { apiClient } from './client';
import { PublicPlayer, InventoryItem, ApiResponse } from '@/types';

export const playersApi = {
  getMe: () =>
    apiClient.get<ApiResponse<PublicPlayer>>('/players/me'),

  updateMe: (data: Partial<Pick<PublicPlayer, 'username'>>) =>
    apiClient.patch<ApiResponse<PublicPlayer>>('/players/me', data),

  getRankings: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<ApiResponse<PublicPlayer[]>>('/players/rankings', { params }),

  getMyInventory: () =>
    apiClient.get<ApiResponse<InventoryItem[]>>('/players/me/inventory'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<PublicPlayer>>(`/players/${id}`),
};
