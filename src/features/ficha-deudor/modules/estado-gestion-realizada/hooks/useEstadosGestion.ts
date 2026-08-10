import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';
import { useEstadosGestionHistoricos } from './useEstadosGestionHistoricos';
import { useEstadosGestionResumidos } from './useEstadosGestionResumidos';
import type { UseEstadosGestionReturn } from '../types/useEstadosGestion.types';

export type {
  SelectedFilters,
  TextFilters,
} from '@shared/hooks/useClientSideTable';
export type { UseEstadosGestionReturn } from '../types/useEstadosGestion.types';

interface UseEstadosGestionOptions {
  loadHistoricos?: boolean;
}

export function useEstadosGestion(
  params: FichaDeudorCarteraPanelParams,
  {
    loadHistoricos = true,
  }: UseEstadosGestionOptions = {}
): UseEstadosGestionReturn {
  const resumidos =
    useEstadosGestionResumidos(params);
  const historicos =
    useEstadosGestionHistoricos(params, {
      enabled: loadHistoricos,
    });

  return {
    allData: resumidos.allData,
    filteredData: resumidos.filteredData,
    paginatedData: resumidos.paginatedData,
    isLoading: resumidos.isLoading,
    error: resumidos.error,
    pageNumber: resumidos.pageNumber,
    pageSize: resumidos.pageSize,
    totalRecords: resumidos.totalRecords,
    totalPages: resumidos.totalPages,
    setPageNumber: resumidos.setPageNumber,
    setPageSize: resumidos.setPageSize,
    refetch: resumidos.refetch,
    textFilters: resumidos.textFilters,
    selectedFilters: resumidos.selectedFilters,
    onTextFilterChange:
      resumidos.onTextFilterChange,
    onSelectedFilterChange:
      resumidos.onSelectedFilterChange,
    completo: historicos.paginatedData,
    completoAllData: historicos.allData,
    completoFilteredData:
      historicos.filteredData,
    completoLoading: historicos.isLoading,
    completoError: historicos.error,
    completoPageNumber: historicos.pageNumber,
    completoPageSize: historicos.pageSize,
    completoTotalRecords:
      historicos.totalRecords,
    completoTotalPages: historicos.totalPages,
    completoTextFilters: historicos.textFilters,
    completoSelectedFilters:
      historicos.selectedFilters,
    setCompletoPageNumber:
      historicos.setPageNumber,
    setCompletoPageSize:
      historicos.setPageSize,
    onCompletoTextFilterChange:
      historicos.onTextFilterChange,
    onCompletoSelectedFilterChange:
      historicos.onSelectedFilterChange,
    refetchCompleto: historicos.refetch,
  };
}
