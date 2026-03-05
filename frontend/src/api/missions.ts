import { apiClient } from './client';
import { Mission, MissionDifficulty, ApiResponse } from '@/types';

export const missionsApi = {
  getActive: () =>
    apiClient.get<ApiResponse<Mission[]>>('/missions/active'),

  getHistory: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<ApiResponse<Mission[]>>('/missions/history', { params }),

  generate: (difficulty: MissionDifficulty = 'MEDIUM') =>
    apiClient.post<ApiResponse<Mission>>('/missions/generate', { difficulty }),

  complete: (missionId: string) =>
    apiClient.post<ApiResponse<Mission>>(`/missions/${missionId}/complete`),
};
