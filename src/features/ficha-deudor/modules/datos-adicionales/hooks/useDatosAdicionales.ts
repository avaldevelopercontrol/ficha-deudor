import { useCallback } from 'react';
import {
  fetchCabeceraDatosAdicionales,
  fetchAllDatosAdicionales,
} from '../api/datosAdicionalesApi';
import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';
import { useApiResource } from '@shared/hooks/useApiResource';
import { hasRequiredValues } from '../../../shared/utils/requiredValues.utils';
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

export function useDatosAdicionales(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  pantalla = 3
): UseDatosAdicionalesReturn {
  const canLoadCabeceraDatosAdicionales = hasRequiredValues(id_cliente);
  const canLoadDatosAdicionales = hasRequiredValues(
    id_cliente,
    id_cartera,
    id_deudor
  );

  const fetchCabeceraData = useCallback(
    (signal: AbortSignal) =>
      fetchCabeceraDatosAdicionales(
        id_cliente,
        pantalla,
        signal
      ),
    [id_cliente, pantalla]
  );

  const {
    data: columnsData,
    isLoading: metaLoading,
    error: metaError,
  } = useApiResource<ColumnApi[]>(
    fetchCabeceraData,
    [id_cliente, pantalla],
    {
      enabled: canLoadCabeceraDatosAdicionales,
      initialLoading: false,
      errorMessage: DATOS_ADICIONALES_ERROR_MESSAGES.META,
    }
  );

  const columns = columnsData ?? [];

  const fetchDatosAdicionalesData = useCallback(
    (signal: AbortSignal) => {
      return fetchAllDatosAdicionales(
        id_cliente,
        id_cartera,
        id_deudor,
        signal
      );
    },
    [id_cliente, id_cartera, id_deudor]
  );

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