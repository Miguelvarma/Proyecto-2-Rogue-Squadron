// ─────────────────────────────────────────────────────────────
//  HOOK — useMissions
//  Adaptado a las rutas reales del backend
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getActiveMissions,
  getMissionHistory,
  generateAiMission,
  completeMission,
} from '@/api/missions';
import type { Mission, MissionFilters } from '@/types/mission';

export type ToastType = 'success' | 'warning' | 'error' | 'info';
export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  msg: string;
}

export function useMissions() {
  const [missions, setMissions]     = useState<Mission[]>([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionId, setActionId]     = useState<string | null>(null);
  const [toasts, setToasts]         = useState<Toast[]>([]);
  const [filters, setFilters]       = useState<MissionFilters>({
    status: 'all',
    difficulty: 'all',
    aiOnly: false,
  });

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Toast helpers ──────────────────────────────────────────
  const addToast = useCallback((type: ToastType, title: string, msg: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { id, type, title, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Cargar misiones ────────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Carga activas e historial según el filtro de status
      let result: Mission[] = [];

      if (filters.status === 'all' || filters.status === 'active') {
        const active = await getActiveMissions();
        result = [...result, ...active];
      }

      if (filters.status === 'all' || filters.status === 'completed' || filters.status === 'failed') {
        const history = await getMissionHistory();
        result = [...result, ...history];
      }

      // Filtro de dificultad en el frontend
      if (filters.difficulty && filters.difficulty !== 'all') {
        result = result.filter(m => m.difficulty === filters.difficulty);
      }

      // Filtro aiOnly en el frontend
      if (filters.aiOnly) {
        result = result.filter(m => m.isAiGenerated);
      }

      setMissions(result);
    } catch {
      if (!silent) {
        addToast('error', 'Error de conexión', 'No se pudieron cargar las misiones.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters, addToast]);

  // Carga inicial + cuando cambian los filtros
  useEffect(() => { void load(); }, [load]);

  // Polling cada 30s
  useEffect(() => {
    pollingRef.current = setInterval(() => void load(true), 30_000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [load]);

  // ── Generar misión IA ──────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await generateAiMission() as unknown as { estado: string; datos: Mission };
      const mission = res.datos;
      setMissions(prev => [mission, ...prev]);
      addToast('info', '🔮 Nueva Misión del Oráculo', "Misión generada correctamente.");
    } catch {
      addToast('error', 'Error', 'El oráculo arcano no responde. Inténtalo de nuevo.');
    } finally {
      setGenerating(false);
    }
  }, [addToast]);

  // ── Completar misión ───────────────────────────────────────
  const handleComplete = useCallback(async (id: string) => {
    setActionId(id);
    try {
      const { message } = await completeMission(id);
      setMissions(prev => prev.map(m =>
        m.id === id ? { ...m, status: 'completed' as const } : m,
      ));
      addToast('success', '✅ ¡Misión Completada!', message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      addToast('error', 'No se pudo completar', msg);
    } finally {
      setActionId(null);
    }
  }, [addToast]);

  return {
    missions,
    loading,
    generating,
    actionId,
    toasts,
    filters,
    setFilters,
    handleGenerate,
    handleComplete,
    removeToast,
    reload: load,
  };
}