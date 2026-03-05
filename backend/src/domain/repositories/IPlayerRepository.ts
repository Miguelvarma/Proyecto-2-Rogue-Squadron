import { Player } from '../entities/Player';

export interface IPlayerRepository {
  findById(id: string): Promise<Player | null>;
  findByEmail(email: string): Promise<Player | null>;
  findByUsername(username: string): Promise<Player | null>;
  save(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player>;
  update(id: string, data: Partial<Player>): Promise<Player>;
  updateRank(id: string, newRank: number): Promise<void>;
  getRankings(limit: number, offset: number): Promise<Player[]>;
}
