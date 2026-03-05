export interface InventoryItem {
  id: string;
  playerId: string;
  itemTemplateId: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  acquiredAt: Date;
  metadata: Record<string, unknown>;
}
