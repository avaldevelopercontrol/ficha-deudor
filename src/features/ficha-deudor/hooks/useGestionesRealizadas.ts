import { useState, useEffect, useCallback } from 'react';
import { fetchGestionesRealizadas } from '../api/gestionesRealizadasApi';
import type { GestionRealizada, GestionCompleta } from '../../../shared/types';

interface UseGestionesReturn {
  resumido: GestionRealizada[];
  completo: GestionCompleta[];
  isLoading: boolean;
  error: string | null;
  setResumido: React.Dispatch<React.SetStateAction<GestionRealizada[]>>;
  refetch: () => void;
}

export function useGestionesRealizadas(
  id_deudor: string,
  id_cartera: string
): UseGestionesReturn {
  const [resumido, setResumido] = useState<GestionRealizada[]>([]);
  const [completo, setCompleto] = useState<GestionCompleta[]>([]);
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
      const result = await fetchGestionesRealizadas(id_deudor, id_cartera);
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

  return { resumido, completo, isLoading, error, setResumido, refetch };
}