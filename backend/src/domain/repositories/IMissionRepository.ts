import { Mission } from '../entities/Mission';

export interface IMissionRepository {
  findById(id: string): Promise<Mission | null>;
  findActiveByPlayer(playerId: string): Promise<Mission[]>;
  findHistoryByPlayer(playerId: string, limit: number, offset: number): Promise<Mission[]>;
  save(mission: Omit<Mission, 'id' | 'generatedAt'>): Promise<Mission>;
  updateStatus(id: string, status: Mission['status'], completedAt?: Date): Promise<void>;
}
