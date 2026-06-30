import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchAgendasByDeudor } from '../../api/popups/agendasApi';
import type { Agenda } from '../../../../shared/types';
import { useClientSideTable, type TextFilters, type SelectedFilters } from '../../../../shared/hooks/useClientSideTable';

export type { TextFilters, SelectedFilters };

interface UseAgendasByDeudorReturn {
  allData: Agenda[];
  filteredData: Agenda[];
  paginatedData: Agenda[];
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
  resetFilters: () => void;
}

export function useAgendasByDeudor(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_usuario: string
): UseAgendasByDeudorReturn {
  const [allData, setAllData] = useState<Agenda[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetDeps = useMemo(() => [id_cliente, id_cartera, id_deudor, id_usuario] as const, [
    id_cliente, id_cartera, id_deudor, id_usuario,
  ]);

  const table = useClientSideTable<Agenda>(allData, resetDeps, { initialPageSize: 10 });

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ─── Carga inicial ───
  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_deudor || !id_usuario) {
      setAllData([]);
      setError('Faltan parámetros requeridos');
      return;
    }

    const controller = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchAgendasByDeudor(
          id_cliente,
          id_cartera,
          id_deudor,
          id_usuario,
          controller.signal
        );
        if (controller.signal.aborted) return;
        setAllData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error cargando agendas');
          setAllData([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [id_cliente, id_cartera, id_deudor, id_usuario]);

  // ─── Refetch manual ───
  const refetch = useCallback(() => {
    if (!id_cliente || !id_cartera || !id_deudor || !id_usuario) return;

    setIsLoading(true);
    setError(null);

    fetchAgendasByDeudor(id_cliente, id_cartera, id_deudor, id_usuario)
      .then((result) => {
        if (!isMountedRef.current) return;
        setAllData(result);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Error cargando agendas');
        setAllData([]);
      })
      .finally(() => {
        if (!isMountedRef.current) setIsLoading(false);
      });
  }, [id_cliente, id_cartera, id_deudor, id_usuario]);

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
    resetFilters: table.resetFilters,
  };
}