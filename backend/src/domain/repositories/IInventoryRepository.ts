import { InventoryItem } from '../entities/InventoryItem';

export interface IInventoryRepository {
  findByPlayer(playerId: string): Promise<InventoryItem[]>;
  findById(id: string): Promise<InventoryItem | null>;
  addItem(item: Omit<InventoryItem, 'id' | 'acquiredAt'>): Promise<InventoryItem>;
  transferItem(itemId: string, fromPlayerId: string, toPlayerId: string): Promise<void>;
  removeItem(itemId: string): Promise<void>;
}
