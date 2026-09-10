import { useCallback } from 'react';
import {
  fetchCabeceraDatosAdicionales,
  fetchAllDatosAdicionales,
  type CabeceraDatosAdicionalesResult,
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

const EMPTY_DATOS_ADICIONALES_COLUMNS: ColumnApi[] = [];

export type { TextFilters, SelectedFilters };

interface UseDatosAdicionalesReturn {
  columns: ColumnApi[];
  isConfigured: boolean;
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
        { idCliente: id_cliente, pantalla },
        signal
      ),
    [id_cliente, pantalla]
  );

  const {
    data: cabeceraData,
    isLoading: metaLoading,
    error: metaError,
    refetch: refetchCabecera,
  } = useApiResource<CabeceraDatosAdicionalesResult>(
    fetchCabeceraData,
    [id_cliente, pantalla],
    {
      enabled: canLoadCabeceraDatosAdicionales,
      initialLoading: canLoadCabeceraDatosAdicionales,
      errorMessage: DATOS_ADICIONALES_ERROR_MESSAGES.META,
    }
  );

  const columns =
    cabeceraData?.columns ?? EMPTY_DATOS_ADICIONALES_COLUMNS;
  const isConfigured = cabeceraData?.isConfigured ?? false;

  const fetchDatosAdicionalesData = useCallback(
    (signal: AbortSignal) => {
      return fetchAllDatosAdicionales(
        {
          idCliente: id_cliente,
          idCartera: id_cartera,
          idDeudor: id_deudor,
        },
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
    refetch: refetchData,
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

  const isLoading =
    metaLoading || (isConfigured && dataLoading);
  const error =
    metaError || (isConfigured ? dataError : null);

  const refetch = useCallback(async () => {
    const requests: Promise<void>[] = [refetchCabecera()];

    if (canLoadDatosAdicionales) {
      requests.push(refetchData());
    }

    await Promise.all(requests);
  }, [
    canLoadDatosAdicionales,
    refetchCabecera,
    refetchData,
  ]);

  return {
    columns,
    isConfigured,
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