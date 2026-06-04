// src/hooks/useTelefonosReferenciados.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchTelefonosReferenciados, 
  createTelefono, 
  updateTelefono 
} from '../api/telefonosReferenciadosApi';
import type { TelefonoReferenciado, TelefonoFormData } from '../../../shared/types';

interface UseTelefonosReturn {
  data: TelefonoReferenciado[];
  isLoading: boolean;
  error: string | null;
  setData: React.Dispatch<React.SetStateAction<TelefonoReferenciado[]>>;
  create: (formData: TelefonoFormData) => Promise<void>;
  update: (id: string, formData: TelefonoFormData) => Promise<void>;
  refetch: () => void;
}

export function useTelefonosReferenciados(
  id_deudor: string,
  id_cartera: string
): UseTelefonosReturn {
  const [data, setData] = useState<TelefonoReferenciado[]>([]);
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
      const result = await fetchTelefonosReferenciados(id_deudor, id_cartera);
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

  // ─── CREATE ───
  const create = useCallback(async (formData: TelefonoFormData) => {
    try {
      await createTelefono(id_deudor, id_cartera, formData);
      await loadData(new AbortController().signal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear teléfono';
      setError(msg);
      throw err;
    }
  }, [id_deudor, id_cartera, loadData]);

  // ─── UPDATE ───
  const update = useCallback(async (id: string, formData: TelefonoFormData) => {
    try {
      await updateTelefono(id_deudor, id_cartera, id, formData);
      await loadData(new AbortController().signal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar teléfono';
      setError(msg);
      throw err;
    }
  }, [id_deudor, id_cartera, loadData]);

  return { data, isLoading, error, setData, create, update, refetch };
}