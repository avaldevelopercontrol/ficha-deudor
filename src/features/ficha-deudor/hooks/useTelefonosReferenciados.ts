import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchTelefonosReferenciados,
  fetchTelefonoResultados,
  createTelefono,
  updateTelefono,
  fetchTelefonoOperadores,
  fetchTelefonoUbicaciones,
  fetchTelefonoHorarioGestion,
  fetchTelefonoFuenteBusqueda,
} from '../api/telefonosReferenciadosApi';
import type { TelefonoReferenciado, TelefonoFormData, TelefonoList } from '../../../shared/types';
import { useApiResource } from '../../../shared/hooks/useApiResource';

export interface TextFilters {
  [columnKey: string]: string;
}

export interface SelectedFilters {
  [columnKey: string]: string[];
}

interface UseTelefonosReferenciadosReturn {
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
  update: (id: string, formData: TelefonoFormData) => Promise<void>;
}

export function useTelefonosReferenciados(
  id_cliente: string,
  id_deudor: string
): UseTelefonosReferenciadosReturn {
  const [allData, setAllData] = useState<TelefonoReferenciado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [textFilters, setTextFilters] = useState<TextFilters>({});
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});

  // ─── Efecto: Cargar todos los registros ───
  useEffect(() => {
    if (!id_cliente || !id_deudor) return;

    const controller = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // El service ya devuelve TelefonoReferenciado[] mapeado
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

  // ─── Resetear página y filtros cuando cambian IDs ───
  useEffect(() => {
    setPageNumber(1);
    setTextFilters({});
    setSelectedFilters({});
  }, [id_cliente, id_deudor]);

  // Resetear página cuando cambia pageSize
  useEffect(() => {
    setPageNumber(1);
  }, [pageSize]);

  // ─── Filtros client-side ───
  const filteredData = useMemo(() => {
    return allData.filter((row) => {
      for (const [columnKey, filterText] of Object.entries(textFilters)) {
        if (!filterText) continue;
        const cellValue = String(row[columnKey as keyof TelefonoReferenciado] ?? '').toLowerCase();
        if (!cellValue.includes(filterText.toLowerCase())) return false;
      }

      for (const [columnKey, selectedValues] of Object.entries(selectedFilters)) {
        if (!selectedValues || selectedValues.length === 0) continue;
        const cellValue = String(row[columnKey as keyof TelefonoReferenciado] ?? '');
        if (!selectedValues.includes(cellValue)) return false;
      }

      return true;
    });
  }, [allData, textFilters, selectedFilters]);

  // ─── Paginación client-side ───
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(indiceInicio + pageSize, totalRecords);
  const paginatedData = filteredData.slice(indiceInicio, indiceFin);

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

  // ─── Handlers de filtros ───
  const onTextFilterChange = useCallback((columnKey: string, value: string) => {
    setTextFilters((prev) => ({ ...prev, [columnKey]: value }));
    setPageNumber(1);
  }, []);

  const onSelectedFilterChange = useCallback((columnKey: string, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [columnKey]: values }));
    setPageNumber(1);
  }, []);

  // ─── CREATE ───
  const create = useCallback(
    async (formData: TelefonoFormData) => {
      try {
        await createTelefono(id_cliente, id_deudor, formData);
        await refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al crear teléfono';
        setError(msg);
        throw err;
      }
    },
    [id_cliente, id_deudor, refetch]
  );

  // ─── UPDATE ───
  const update = useCallback(
    async (id: string, formData: TelefonoFormData) => {
      try {
        await updateTelefono(id_cliente, id_deudor, id, formData);
        await refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al actualizar teléfono';
        setError(msg);
        throw err;
      }
    },
    [id_cliente, id_deudor, refetch]
  );

  return {
    allData,
    filteredData,
    paginatedData,
    isLoading,
    error,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber,
    setPageSize,
    refetch,
    textFilters,
    selectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
    create,
    update,
  };
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