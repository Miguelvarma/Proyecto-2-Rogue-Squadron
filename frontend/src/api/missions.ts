// ─────────────────────────────────────────────────────────────
//  API — Módulo Misiones (integrado: branch 1 + branch 2)
// ─────────────────────────────────────────────────────────────
import { apiClient } from './client';
import type { Mission, GenerateMissionResponse } from '@/types/mission';

const BASE = '/missions';

// GET /missions/active — misiones activas del jugador
export async function getActiveMissions(): Promise<Mission[]> {
  const { data } = await apiClient.get<{ estado: string; datos: Mission[] }>(`${BASE}/active`);
  return data.datos.filter(Boolean);
}

// GET /missions/history — historial de misiones
export async function getMissionHistory(): Promise<Mission[]> {
  const { data } = await apiClient.get<{ estado: string; datos: Mission[] }>(`${BASE}/history`);
  return data.datos;
}

// POST /missions/generate — IA genera nueva misión
export async function generateAiMission(): Promise<GenerateMissionResponse> {
  const { data } = await apiClient.post<GenerateMissionResponse>(`${BASE}/generate`);
  return data;
}

// POST /missions/:id/complete — completar misión
export async function completeMission(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(`${BASE}/${id}/complete`);
  return data;
}
