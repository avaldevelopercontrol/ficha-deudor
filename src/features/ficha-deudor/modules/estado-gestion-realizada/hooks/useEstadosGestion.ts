import { useCallback } from 'react';
import {
  fetchEstadosGestion,
  fetchEstadosGestionHistoricos,
} from '../api/estadosGestionApi';
import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';
import { useServerSideResourceTable } from '@shared/hooks/useServerSideResourceTable';
import type {
  TextFilters,
  SelectedFilters,
} from '@shared/hooks/useClientSideTable';
import type {
  EstadoGestion,
  EstadoGestionCompleta,
} from '../../../shared/types';
import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';
import {
  ESTADOS_GESTION_ERROR_MESSAGES,
  ESTADOS_GESTION_HISTORICOS_INITIAL_PAGE_SIZE,
  ESTADOS_GESTION_INITIAL_PAGE_SIZE,
} from '../constants/estadosGestion.constants';
import { hasRequiredValues } from '../../../shared/utils/requiredValues.utils';

export type { TextFilters, SelectedFilters };

export interface UseEstadosGestionReturn {
  allData: EstadoGestion[];
  filteredData: EstadoGestion[];
  paginatedData: EstadoGestion[];
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

  completo: EstadoGestionCompleta[];
  completoLoading: boolean;
  completoError: string | null;
  completoPageNumber: number;
  completoPageSize: number;
  completoTotalRecords: number;
  completoTotalPages: number;
  setCompletoPageNumber: (page: number) => void;
  setCompletoPageSize: (size: number) => void;
  refetchCompleto: () => Promise<void>;
}

export function useEstadosGestion(
  params: FichaDeudorCarteraPanelParams
): UseEstadosGestionReturn {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
  } = params;
  const canLoadEstadosGestion = hasRequiredValues(
    id_cliente,
    id_cartera,
    id_deudor
  );

  const fetchEstadosGestionResumidos = useCallback(async () => {
    const result = await fetchEstadosGestion(
      id_cliente,
      id_cartera,
      id_deudor
    );

    return result.resumido;
  }, [id_cliente, id_cartera, id_deudor]);

  const {
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
  } = useClientSideResourceTable<EstadoGestion>({
    fetchData: fetchEstadosGestionResumidos,
    resetDeps: [id_cliente, id_cartera, id_deudor],
    enabled: canLoadEstadosGestion,
    initialPageSize: ESTADOS_GESTION_INITIAL_PAGE_SIZE,
    errorMessage: ESTADOS_GESTION_ERROR_MESSAGES.RESUMIDOS,
  });

  const fetchEstadosGestionCompletos = useCallback(
    async (page: number, size: number) => {
      const result = await fetchEstadosGestionHistoricos(
        id_cliente,
        id_cartera,
        id_deudor,
        page,
        size
      );

      return {
        data: result.completo,
        totalRecords: result.totalRecords,
        totalPages: result.totalPages,
      };
    },
    [id_cliente, id_cartera, id_deudor]
  );

  const {
    data: completo,
    isLoading: completoLoading,
    error: completoError,
    pageNumber: completoPageNumber,
    pageSize: completoPageSize,
    totalRecords: completoTotalRecords,
    totalPages: completoTotalPages,
    setPageNumber: setCompletoPageNumber,
    setPageSize: setCompletoPageSize,
    refetch: refetchCompleto,
  } = useServerSideResourceTable<EstadoGestionCompleta>({
    fetchData: fetchEstadosGestionCompletos,
    enabled: canLoadEstadosGestion,
    initialPageSize: ESTADOS_GESTION_HISTORICOS_INITIAL_PAGE_SIZE,
    errorMessage: ESTADOS_GESTION_ERROR_MESSAGES.HISTORICOS,
  });

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

    completo,
    completoLoading,
    completoError,
    completoPageNumber,
    completoPageSize,
    completoTotalRecords,
    completoTotalPages,
    setCompletoPageNumber,
    setCompletoPageSize,
    refetchCompleto,
  };
}