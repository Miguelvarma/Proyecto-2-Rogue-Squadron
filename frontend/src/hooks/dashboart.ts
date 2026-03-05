// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import { inventoryApi } from '@/api/inventory';

export function useDashboard() {
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Obtener total de items (página 1, limit 1 solo para contar)
        const response = await inventoryApi.getItems({ page: 1, limit: 1 });
        setTotalItems(response.total);
      } catch (err) {
        setError('Error al cargar datos del dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { totalItems, loading, error };
}