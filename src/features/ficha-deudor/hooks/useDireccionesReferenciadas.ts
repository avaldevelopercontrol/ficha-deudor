import { useState, useEffect, useCallback } from 'react';
import { 
  fetchDireccionesReferenciadas, 
  createDireccion, 
  updateDireccion 
} from '../api/direccionesReferenciadasApi';
import type { DireccionReferenciada, DireccionFormData, DireccionEditFormData } from '../../../shared/types';

interface UseDireccionesReturn {
  data: DireccionReferenciada[];
  isLoading: boolean;
  error: string | null;
  setData: React.Dispatch<React.SetStateAction<DireccionReferenciada[]>>;
  create: (formData: DireccionFormData) => Promise<void>;
  update: (id: string, formData: DireccionEditFormData) => Promise<void>;
  refetch: () => void;
}

export function useDireccionesReferenciadas(
  id_deudor: string,
  id_cartera: string
): UseDireccionesReturn {
  const [data, setData] = useState<DireccionReferenciada[]>([]);
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
      const result = await fetchDireccionesReferenciadas(id_deudor, id_cartera);
      if (signal.aborted) return;
      setData(result);
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

  // ─── CREATE (ya lo tienes) ───
  const create = useCallback(async (formData: DireccionFormData) => {
    try {
      await createDireccion(id_deudor, id_cartera, formData);
      await loadData(new AbortController().signal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear dirección';
      setError(msg);
      throw err;
    }
  }, [id_deudor, id_cartera, loadData]);

  // ─── UPDATE ───
  const update = useCallback(async (id: string, formData: DireccionEditFormData) => {
    try {
      await updateDireccion(id_deudor, id_cartera, id, formData);
      await loadData(new AbortController().signal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar dirección';
      setError(msg);
      throw err;
    }
  }, [id_deudor, id_cartera, loadData]);

  return { data, isLoading, error, setData, create, update, refetch };
}