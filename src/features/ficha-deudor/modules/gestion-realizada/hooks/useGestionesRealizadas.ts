import type { FichaDeudorGestionPanelParams } from '../../../shared/types/fichaDeudor.types';
import { useGestionesHistoricas } from './useGestionesHistoricas';
import { useGestionesResumidas } from './useGestionesResumidas';
import type { UseGestionesRealizadasReturn } from '../types/useGestionesRealizadas.types';

export type {
  SelectedFilters,
  TextFilters,
} from '@shared/hooks/useClientSideTable';
export type { UseGestionesRealizadasReturn } from '../types/useGestionesRealizadas.types';

interface UseGestionesRealizadasOptions {
  loadHistoricas?: boolean;
}

export function useGestionesRealizadas(
  params: FichaDeudorGestionPanelParams,
  {
    loadHistoricas = true,
  }: UseGestionesRealizadasOptions = {}
): UseGestionesRealizadasReturn {
  const resumidas = useGestionesResumidas(params);
  const historicas = useGestionesHistoricas(
    params,
    {
      enabled: loadHistoricas,
    }
  );

  return {
    allData: resumidas.allData,
    filteredData: resumidas.filteredData,
    paginatedData: resumidas.paginatedData,
    isLoading: resumidas.isLoading,
    error: resumidas.error,
    pageNumber: resumidas.pageNumber,
    pageSize: resumidas.pageSize,
    totalRecords: resumidas.totalRecords,
    totalPages: resumidas.totalPages,
    setPageNumber: resumidas.setPageNumber,
    setPageSize: resumidas.setPageSize,
    refetch: resumidas.refetch,
    textFilters: resumidas.textFilters,
    selectedFilters: resumidas.selectedFilters,
    onTextFilterChange:
      resumidas.onTextFilterChange,
    onSelectedFilterChange:
      resumidas.onSelectedFilterChange,
    setResumido: resumidas.setAllData,
    completo: historicas.paginatedData,
    completoAllData: historicas.allData,
    completoFilteredData:
      historicas.filteredData,
    completoLoading: historicas.isLoading,
    completoError: historicas.error,
    completoPageNumber: historicas.pageNumber,
    completoPageSize: historicas.pageSize,
    completoTotalRecords:
      historicas.totalRecords,
    completoTotalPages: historicas.totalPages,
    completoTextFilters: historicas.textFilters,
    completoSelectedFilters:
      historicas.selectedFilters,
    setCompletoPageNumber:
      historicas.setPageNumber,
    setCompletoPageSize:
      historicas.setPageSize,
    onCompletoTextFilterChange:
      historicas.onTextFilterChange,
    onCompletoSelectedFilterChange:
      historicas.onSelectedFilterChange,
    refetchCompleto: historicas.refetch,
  };
}
