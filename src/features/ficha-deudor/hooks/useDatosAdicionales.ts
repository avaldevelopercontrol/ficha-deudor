import { useState, useEffect, useCallback } from 'react';
import { fetchCabeceraDatosAdicionales, fetchAllDatosAdicionales } from '../api/datosAdicionalesApi';
import { useClientSideTable, type TextFilters, type SelectedFilters } from '../../../shared/hooks/useClientSideTable';
import type { ColumnApi, DatoAdicionalApi } from '../../../shared/types/indexApi';

// Re-exportar tipos para compatibilidad con los paneles
export type { TextFilters, SelectedFilters };

interface UseDatosAdicionalesReturn {
  columns: ColumnApi[];
  allData: DatoAdicionalApi[];
  filteredData: DatoAdicionalApi[];
  paginatedData: DatoAdicionalApi[];
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
}

export function useDatosAdicionales(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  pantalla: number = 3
): UseDatosAdicionalesReturn {

  const [columns, setColumns] = useState<ColumnApi[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [allData, setAllData] = useState<DatoAdicionalApi[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // ─── Hook genérico: filtros + paginación ───
  const table = useClientSideTable<DatoAdicionalApi>(
    allData,
    [id_cliente, id_cartera, id_deudor],
    { initialPageSize: 10 }
  );

  // ─── Efecto 1: Cargar cabeceras ───
  useEffect(() => {
    if (!id_cliente) return;
    let cancelled = false;

    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const cols = await fetchCabeceraDatosAdicionales(id_cliente, pantalla);
        if (!cancelled) setColumns(cols);
      } catch (err) {
        if (!cancelled) {
          setMetaError(err instanceof Error ? err.message : 'Error cargando cabeceras');
        }
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    };

    loadMeta();
    return () => { cancelled = true; };
  }, [id_cliente, pantalla]);

  // ─── Efecto 2: Cargar datos ───
  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;
    let cancelled = false;

    const loadData = async () => {
      setDataLoading(true);
      setDataError(null);
      try {
        const result = await fetchAllDatosAdicionales(id_cliente, id_cartera, id_deudor);
        if (cancelled) return;
        setAllData(result);
      } catch (err) {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : 'Error cargando datos adicionales');
          setAllData([]);
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_deudor]);

  // ─── Refetch ───
  const refetch = useCallback(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);

    fetchAllDatosAdicionales(id_cliente, id_cartera, id_deudor)
      .then((result) => {
        if (cancelled) return;
        setAllData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : 'Error cargando datos adicionales');
          setAllData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_deudor]);

  const isLoading = metaLoading || dataLoading;
  const error = metaError || dataError;

  return {
    columns,
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
  };
}