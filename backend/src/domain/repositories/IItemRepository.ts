// domain/repositories/IItemRepository.ts
import { Item } from '../entities/Item';

export interface ItemFilters {
  tipo?: string;
  rareza?: string;
  userId?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IItemRepository {
  findById(id: string): Promise<Item | null>;
  findAll(filters: ItemFilters): Promise<PaginatedResult<Item>>; // ✅ Ahora incluye page y totalPages
  search(query: string): Promise<Item[]>;
  save(item: Item): Promise<Item>;
  update(item: Item): Promise<Item>;
  delete(id: string): Promise<boolean>;
  reactivate(id: string): Promise<boolean>;
  findByUser(userId: string, filters: ItemFilters): Promise<PaginatedResult<Item>>;
}