// ─────────────────────────────────────────────────────────────
//  TIPOS — Módulo Misiones
// ─────────────────────────────────────────────────────────────

export type MissionStatus = 'available' | 'active' | 'completed' | 'failed' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
export type MissionDifficulty = 'common' | 'rare' | 'epic' | 'legendary';

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty?: MissionDifficulty;
  status: MissionStatus;
  reward: number;
  xpReward?: number;
  progressPct?: number;
  timeLeftSeconds?: number;
  isAiGenerated?: boolean;
  icon?: string;
  createdAt: string;
  expiresAt?: string;
  // Campos del backend
  playerId?: string;
  objective?: string;
  aiModel?: string;
  completedAt?: string | null;
  evaluationScore?: number | null;
}

export interface GenerateMissionResponse {
  mission: Mission;
  message: string;
}

export interface MissionFilters {
  status?: MissionStatus | 'all';
  difficulty?: MissionDifficulty | 'all';
  aiOnly?: boolean;
}

export interface PaginatedMissions {
  data: Mission[];
  total: number;
  page: number;
  limit: number;
}