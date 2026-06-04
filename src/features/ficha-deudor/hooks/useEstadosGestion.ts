import { useState, useEffect, useCallback } from 'react';
import { fetchEstadosGestion } from '../api/estadosGestionApi';
import type { EstadoGestion, EstadoGestionCompleta } from '../../../shared/types';

interface UseEstadosGestionReturn {
  resumido: EstadoGestion[];
  completo: EstadoGestionCompleta[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEstadosGestion(
  id_deudor: string,
  id_cartera: string
): UseEstadosGestionReturn {
  const [resumido, setResumido] = useState<EstadoGestion[]>([]);
  const [completo, setCompleto] = useState<EstadoGestionCompleta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (signal: AbortSignal) => {
    if (!id_deudor || !id_cartera) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchEstadosGestion(id_deudor, id_cartera);
      if (signal.aborted) return;
      setResumido(result.resumido);
      setCompleto(result.completo);
    } catch (err) {
      if (signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, [id_deudor, id_cartera]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  return { resumido, completo, isLoading, error, refetch };
}