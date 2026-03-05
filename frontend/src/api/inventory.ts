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

export const inventoryApi = {
  getItems: async (filters: Filters = {}): Promise<PaginatedResponse<Item>> => {
    const params = new URLSearchParams();
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.rareza) params.append('rareza', filters.rareza);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<PaginatedResponse<Item>>(`/inventory?${params.toString()}`);
    return response.data;
  },

  searchItems: async (query: string): Promise<SearchResponse> => {
    const response = await apiClient.get<SearchResponse>(`/inventory/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getItemById: async (id: string): Promise<ItemDetailResponse> => {
    const response = await apiClient.get<ItemDetailResponse>(`/inventory/${id}`);
    return response.data;
  },

  deleteItem: async (id: string): Promise<DeleteItemResponse> => {
    const response = await apiClient.delete<DeleteItemResponse>(`/inventory/${id}`);
    return response.data;
  },
};