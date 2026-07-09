import { useState, useEffect, useCallback } from 'react';
import {
  fetchCabeceraDatosAdicionales,
  fetchAllDatosAdicionales,
} from '../api/datosAdicionalesApi';
import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';
import type {
  TextFilters,
  SelectedFilters,
} from '@shared/hooks/useClientSideTable';
import type {
  ColumnApi,
  DatoAdicionalApi,
} from '../../../shared/types';
import {
  DATOS_ADICIONALES_ERROR_MESSAGES,
  DATOS_ADICIONALES_INITIAL_PAGE_SIZE,
} from '../constants/datosAdicionales.constants';

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

const hasRequiredValues = (...values: string[]) => {
  return values.every((value) => value.trim() !== '');
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  return error instanceof Error ? error.message : fallbackMessage;
};

export function useDatosAdicionales(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  pantalla = 3
): UseDatosAdicionalesReturn {
  const [columns, setColumns] = useState<ColumnApi[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const canLoadCabeceraDatosAdicionales = hasRequiredValues(id_cliente);
  const canLoadDatosAdicionales = hasRequiredValues(
    id_cliente,
    id_cartera,
    id_deudor
  );

  useEffect(() => {
    if (!canLoadCabeceraDatosAdicionales) return;

    let cancelled = false;

    const loadCabeceraDatosAdicionales = async () => {
      setMetaLoading(true);
      setMetaError(null);

      try {
        const cols = await fetchCabeceraDatosAdicionales(id_cliente, pantalla);

        if (!cancelled) {
          setColumns(cols);
        }
      } catch (error) {
        if (!cancelled) {
          setMetaError(
            getErrorMessage(error, DATOS_ADICIONALES_ERROR_MESSAGES.META)
          );
        }
      } finally {
        if (!cancelled) {
          setMetaLoading(false);
        }
      }
    };

    void Promise.resolve().then(() => {
      void loadCabeceraDatosAdicionales();
    });

    return () => {
      cancelled = true;
    };
  }, [canLoadCabeceraDatosAdicionales, id_cliente, pantalla]);

  const fetchDatosAdicionalesData = useCallback(() => {
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
    fetchData: fetchDatosAdicionalesData,
    resetDeps: [id_cliente, id_cartera, id_deudor],
    enabled: canLoadDatosAdicionales,
    initialPageSize: DATOS_ADICIONALES_INITIAL_PAGE_SIZE,
    errorMessage: DATOS_ADICIONALES_ERROR_MESSAGES.DATA,
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