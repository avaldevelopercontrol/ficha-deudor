import { useState, useEffect, useCallback } from 'react';
import {
  fetchTelefonosReferenciados,
  fetchTelefonoResultados,
  createTelefono,
  updateTelefono,
  fetchTelefonoOperadores,
  fetchTelefonoUbicaciones,
  fetchTelefonoHorarioGestion,
  fetchTelefonoFuenteBusqueda,
  fetchTelefonoById,
} from '../api/telefonosReferenciadosApi';
import { useClientSideTable, type TextFilters, type SelectedFilters } from '../../../shared/hooks/useClientSideTable';
import type { TelefonoReferenciado, TelefonoFormData, TelefonoList, TelefonoEditarApi } from '../../../shared/types';
import { useApiResource } from '../../../shared/hooks/useApiResource';

// Re-exportar tipos para compatibilidad con los paneles
export type { TextFilters, SelectedFilters };

export interface UseTelefonosReferenciadosReturn {
  allData: TelefonoReferenciado[];
  filteredData: TelefonoReferenciado[];
  paginatedData: TelefonoReferenciado[];
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
  textFilters: TextFilters;
  selectedFilters: SelectedFilters;
  onTextFilterChange: (columnKey: string, value: string) => void;
  onSelectedFilterChange: (columnKey: string, values: string[]) => void;
  create: (formData: TelefonoFormData) => Promise<void>;
  update: (id: number, formData: TelefonoFormData) => Promise<void>;
}

export function useTelefonosReferenciados(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string
): UseTelefonosReferenciadosReturn {
  const [allData, setAllData] = useState<TelefonoReferenciado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Hook genérico: filtros + paginación ───
  const table = useClientSideTable<TelefonoReferenciado>(
    allData,
    [id_cliente, id_deudor],
    { initialPageSize: 10 }
  );

  // ─── Efecto: Cargar todos los registros ───
  useEffect(() => {
    if (!id_cliente || !id_deudor) return;

    const controller = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchTelefonosReferenciados(id_cliente, id_deudor);
        if (controller.signal.aborted) return;
        setAllData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error cargando teléfonos');
          setAllData([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [id_cliente, id_deudor]);

  // ─── Refetch ───
  const refetch = useCallback(() => {
    if (!id_cliente || !id_deudor) return;

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchTelefonosReferenciados(id_cliente, id_deudor)
      .then((result) => {
        if (controller.signal.aborted) return;
        setAllData(result);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error cargando teléfonos');
          setAllData([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id_cliente, id_deudor]);

  // ─── CREATE ───
  const create = useCallback(
    async (formData: TelefonoFormData) => {
      try {
        await createTelefono(id_cliente, id_deudor, id_usuario, formData);
        await refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al crear teléfono';
        setError(msg);
        throw err;
      }
    },
    [id_cliente, id_deudor, id_usuario, refetch]
  );

  // ─── UPDATE ───
  const update = useCallback(
    async (id: number, formData: TelefonoFormData) => {
      try {
        await updateTelefono(id_cliente, id_deudor, id_usuario, id, formData);
        await refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al actualizar teléfono';
        setError(msg);
        throw err;
      }
    },
    [id_cliente, id_deudor, id_usuario, refetch]
  );

  return {
    allData,
    filteredData: table.filteredData,
    paginatedData: table.paginatedData,
    isLoading,
    error,
    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords: table.totalRecords,
    totalPages: table.totalPages,
    setPageNumber: table.setPageNumber,
    setPageSize: table.setPageSize,
    refetch,
    textFilters: table.textFilters,
    selectedFilters: table.selectedFilters,
    onTextFilterChange: table.onTextFilterChange,
    onSelectedFilterChange: table.onSelectedFilterChange,
    create,
    update,
  };
}

// ─── Funciones auxiliares (sin cambios) ───

export function parseApiDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  if (dateStr.includes('T')) return dateStr;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

export function useTelefonoById(idTelefono: number | null) {
  const [data, setData] = useState<TelefonoEditarApi | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idTelefono) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchTelefonoById(idTelefono, controller.signal)
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setData(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [idTelefono]);

  return { data, isLoading, error };
}

export function useTelefonoResultados() {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchTelefonoResultados(signal),
    []
  );

  return useApiResource<TelefonoList[]>(fetcher, []);
}

export function useTelefonoOperadores() {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchTelefonoOperadores(signal),
    []
  );

  return useApiResource<TelefonoList[]>(fetcher, []);
}

export function useTelefonoUbicaciones() {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchTelefonoUbicaciones(signal),
    []
  );

  return useApiResource<TelefonoList[]>(fetcher, []);
}

export function useTelefonoHorarioGestion() {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchTelefonoHorarioGestion(signal),
    []
  );

  return useApiResource<TelefonoList[]>(fetcher, []);
}

export function useTelefonoFuenteBusqueda() {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchTelefonoFuenteBusqueda(signal),
    []
  );

  return useApiResource<TelefonoList[]>(fetcher, []);
}