export type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export interface Mission {
  id: string;
  playerId: string;
  title: string;
  description: string;
  objective: string;
  rewardCoins: number;
  rewardItem?: string;
  status: MissionStatus;
  aiModel: string;
  generatedAt: Date;
  expiresAt: Date;
  completedAt?: Date;
}
