import { useCallback, type Dispatch, type SetStateAction } from 'react';
import {
  fetchGestionesRealizadas,
  fetchGestionesHistoricas,
} from '../api/gestionesRealizadasApi';
import { useClientSideResourceTable } from '../../../shared/hooks/useClientSideResourceTable';
import { useServerSideResourceTable } from '../../../shared/hooks/useServerSideResourceTable';
import type {
  TextFilters,
  SelectedFilters,
} from '../../../shared/hooks/useClientSideTable';
import type {
  GestionRealizada,
  GestionCompleta,
} from '../../../shared/types/indexApi';

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
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_usuario: string
): UseGestionesRealizadasReturn {
  const fetchData = useCallback(async () => {
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
    fetchData,
    resetDeps: [id_cliente, id_cartera, id_deudor, id_usuario],
    enabled: Boolean(id_cliente && id_cartera && id_deudor && id_usuario),
    initialPageSize: 10,
    errorMessage: 'Error cargando gestiones',
  });

  const fetchCompleto = useCallback(
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
    fetchData: fetchCompleto,
    enabled: Boolean(id_cliente && id_cartera && id_deudor),
    initialPageSize: 10,
    errorMessage: 'Error cargando gestiones históricas',
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