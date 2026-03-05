import { Item } from '../entities/Item';

export interface ItemFilters {
  tipo?: string;
  rareza?: string;
  userId?: string;
  page: number;
  limit: number;
}

export interface IItemRepository {
  findById(id: string): Promise<Item | null>;
  findAll(filters: ItemFilters): Promise<{ items: Item[]; total: number }>;
  search(query: string): Promise<Item[]>;
  save(item: Item): Promise<Item>;
  update(item: Item): Promise<Item>;
  delete(id: string): Promise<boolean>;
}