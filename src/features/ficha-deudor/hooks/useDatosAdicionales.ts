import { useState, useEffect, useCallback } from 'react';
import {
  fetchCabeceraDatosAdicionales,
  fetchAllDatosAdicionales,
} from '../api/datosAdicionalesApi';
import { useClientSideResourceTable } from '../../../shared/hooks/useClientSideResourceTable';
import type {
  TextFilters,
  SelectedFilters,
} from '../../../shared/hooks/useClientSideTable';
import type {
  ColumnApi,
  DatoAdicionalApi,
} from '../../../shared/types/indexApi';

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
  refetch: () => Promise<void>;
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

  useEffect(() => {
    if (!id_cliente) return;

    let cancelled = false;

    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError(null);

      try {
        const cols = await fetchCabeceraDatosAdicionales(id_cliente, pantalla);

        if (!cancelled) {
          setColumns(cols);
        }
      } catch (err) {
        if (!cancelled) {
          setMetaError(
            err instanceof Error ? err.message : 'Error cargando cabeceras'
          );
        }
      } finally {
        if (!cancelled) {
          setMetaLoading(false);
        }
      }
    };

    void Promise.resolve().then(() => {
      void loadMeta();
    });

    return () => {
      cancelled = true;
    };
  }, [id_cliente, pantalla]);

  const fetchData = useCallback(() => {
    return fetchAllDatosAdicionales(id_cliente, id_cartera, id_deudor);
  }, [id_cliente, id_cartera, id_deudor]);

  const {
    allData,
    filteredData,
    paginatedData,
    isLoading: dataLoading,
    error: dataError,
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
  } = useClientSideResourceTable<DatoAdicionalApi>({
    fetchData,
    resetDeps: [id_cliente, id_cartera, id_deudor],
    enabled: Boolean(id_cliente && id_cartera && id_deudor),
    initialPageSize: 10,
    errorMessage: 'Error cargando datos adicionales',
  });

  const isLoading = metaLoading || dataLoading;
  const error = metaError || dataError;

  return {
    columns,
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
  };
}