import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchPagosByDeudor } from '../../api/popups/pagosApi';
import type { Pago } from '../../../../shared/types';
import { useClientSideTable, type TextFilters, type SelectedFilters } from '../../../../shared/hooks/useClientSideTable';

export type { TextFilters, SelectedFilters };

interface UsePagosByDeudorReturn {
  allData: Pago[];
  filteredData: Pago[];
  paginatedData: Pago[];
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

export function usePagosByDeudor(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string
): UsePagosByDeudorReturn {
  const [allData, setAllData] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetDeps = useMemo(() => [id_cliente, id_cartera, id_deudor] as const, [
    id_cliente, id_cartera, id_deudor,
  ]);

  const table = useClientSideTable<Pago>(allData, resetDeps, { initialPageSize: 10 });

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ─── Carga inicial ───
  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_deudor) {
      setAllData([]);
      setError('Faltan parámetros requeridos');
      return;
    }

    const controller = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchPagosByDeudor(
          id_cliente,
          id_cartera,
          id_deudor,
          controller.signal
        );
        if (controller.signal.aborted) return;
        setAllData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error cargando pagos');
          setAllData([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [id_cliente, id_cartera, id_deudor]);

  // ─── Refetch manual ───
  const refetch = useCallback(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;

    setIsLoading(true);
    setError(null);

    fetchPagosByDeudor(id_cliente, id_cartera, id_deudor)
      .then((result) => {
        if (!isMountedRef.current) return;
        setAllData(result);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Error cargando pagos');
        setAllData([]);
      })
      .finally(() => {
        if (!isMountedRef.current) setIsLoading(false);
      });
  }, [id_cliente, id_cartera, id_deudor]);

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