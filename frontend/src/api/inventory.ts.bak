// src/api/inventory.ts
import { apiClient } from './client';

export interface Item {
  id: string;
  nombre: string;
  tipo: 'Héroe' | 'Arma' | 'Armadura' | 'Habilidad' | 'Ítem' | 'Épica';
  rareza: 'Común' | 'Rara' | 'Épica' | 'Legendaria';
  imagen: string | null;
  descripcion: string;
  habilidades: string[];
  efectos: string[];
  ataque: number;
  defensa: number;
  createdAt: string;
  updatedAt: string;
}

export interface Filters {
  tipo?: string;
  rareza?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SearchResponse {
  results: Item[];
  total: number;
  query: string;
}

export interface ItemDetailResponse {
  item: Item;
}

export interface DeleteItemResponse {
  message: string;
  item: Item;
  deletedAt: string;
}

// ✅ Interfaces para inventario de compras
export interface PurchasedItem {
  id: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  metadata: {
    type?: string;
    price?: number;
    description?: string;
    attack?: number;
    defense?: number;
  };
  acquired_at: string;
  item_template_id?: string;
}

export interface AddPurchaseItem {
  productId: string;
  name: string;
  rarity: string;
  metadata: {
    type: string;
    price: number;
    description: string;
    [key: string]: any;
  };
}

export const inventoryApi = {
  // Items del juego (armas, armaduras, etc.)
  getItems: async (filters: Filters = {}): Promise<PaginatedResponse<Item>> => {
    const params = new URLSearchParams();
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.rareza) params.append('rareza', filters.rareza);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<PaginatedResponse<Item>>(`/inventory/global?${params.toString()}`);
    return response.data;
  },

  searchItems: async (query: string): Promise<SearchResponse> => {
    const response = await apiClient.get<SearchResponse>(`/inventory/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getItemById: async (id: string): Promise<ItemDetailResponse> => {
    const response = await apiClient.get<ItemDetailResponse>(`/inventory/items/${id}`);
    return response.data;
  },

  deleteItem: async (id: string): Promise<DeleteItemResponse> => {
    const response = await apiClient.delete<DeleteItemResponse>(`/inventory/items/${id}`);
    return response.data;
  },

  // ✅ Funciones para inventario de compras
  addPurchasedItem: async (data: AddPurchaseItem): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/inventory/purchase/add', data);
    return response.data;
  },

  getPurchasedItems: async (): Promise<{ success: boolean; data: PurchasedItem[] }> => {
    const response = await apiClient.get('/inventory/purchase/my');
    return response.data;
  },
};