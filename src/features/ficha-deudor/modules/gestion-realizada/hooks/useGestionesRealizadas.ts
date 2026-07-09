import { useCallback, type Dispatch, type SetStateAction } from 'react';
import {
  fetchGestionesRealizadas,
  fetchGestionesHistoricas,
} from '../api/gestionesRealizadasApi';
import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';
import { useServerSideResourceTable } from '@shared/hooks/useServerSideResourceTable';
import type {
  TextFilters,
  SelectedFilters,
} from '@shared/hooks/useClientSideTable';
import type {
  GestionRealizada,
  GestionCompleta,
} from '../../../shared/types';
import {
  GESTIONES_HISTORICAS_INITIAL_PAGE_SIZE,
  GESTIONES_REALIZADAS_ERROR_MESSAGES,
  GESTIONES_REALIZADAS_INITIAL_PAGE_SIZE,
} from '../constants/gestionesRealizadas.constants';
import type { FichaDeudorGestionPanelParams } from '../../../shared/types/fichaDeudor.types';
import { hasRequiredValues } from '../../../shared/utils/requiredValues.utils';

export type { TextFilters, SelectedFilters };

export interface UseGestionesRealizadasReturn {
  allData: GestionRealizada[];
  filteredData: GestionRealizada[];
  paginatedData: GestionRealizada[];
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
  setResumido: Dispatch<SetStateAction<GestionRealizada[]>>;

  completo: GestionCompleta[];
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

export function useGestionesRealizadas(
  params: FichaDeudorGestionPanelParams
): UseGestionesRealizadasReturn {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
    id_usuario,
  } = params;
  const canLoadResumidas = hasRequiredValues(
    id_cliente,
    id_cartera,
    id_deudor,
    id_usuario
  );

  const canLoadHistoricas = hasRequiredValues(
    id_cliente,
    id_cartera,
    id_deudor
  );

  const fetchGestionesResumidas = useCallback(async () => {
    const result = await fetchGestionesRealizadas(
      id_cliente,
      id_cartera,
      id_deudor,
      id_usuario
    );

    return result.resumido;
  }, [id_cliente, id_cartera, id_deudor, id_usuario]);

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
    setAllData,
  } = useClientSideResourceTable<GestionRealizada>({
    fetchData: fetchGestionesResumidas,
    resetDeps: [id_cliente, id_cartera, id_deudor, id_usuario],
    enabled: canLoadResumidas,
    initialPageSize: GESTIONES_REALIZADAS_INITIAL_PAGE_SIZE,
    errorMessage: GESTIONES_REALIZADAS_ERROR_MESSAGES.RESUMIDAS,
  });

  const fetchGestionesCompletas = useCallback(
    async (page: number, size: number) => {
      const result = await fetchGestionesHistoricas(
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
  } = useServerSideResourceTable<GestionCompleta>({
    fetchData: fetchGestionesCompletas,
    enabled: canLoadHistoricas,
    initialPageSize: GESTIONES_HISTORICAS_INITIAL_PAGE_SIZE,
    errorMessage: GESTIONES_REALIZADAS_ERROR_MESSAGES.HISTORICAS,
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
    setResumido: setAllData,

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