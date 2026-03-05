import { Mission } from '../../domain/entities/Mission';

export interface PlayerContext {
  playerId: string;
  rank: number;
  completedMissions: number;
  preferredStyle?: string;
}

export interface IAIGateway {
  generateMission(context: PlayerContext): Promise<Omit<Mission, 'id' | 'playerId' | 'status' | 'generatedAt' | 'completedAt'>>;
  evaluateObjective(missionId: string, evidence: Record<string, unknown>): Promise<{ passed: boolean; score: number; feedback: string }>;
  generateNarrativeEvent(playerHistory: unknown[]): Promise<string>;
}
