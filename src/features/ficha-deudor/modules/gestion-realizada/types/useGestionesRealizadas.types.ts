import type {
  Dispatch,
  SetStateAction,
} from 'react';
import type {
  SelectedFilters,
  TextFilters,
} from '@shared/hooks/useClientSideTable';
import type {
  GestionCompleta,
  GestionRealizada,
} from './gestionRealizada.types';

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
  onTextFilterChange: (
    columnKey: string,
    value: string
  ) => void;
  onSelectedFilterChange: (
    columnKey: string,
    values: string[]
  ) => void;
  setResumido: Dispatch<
    SetStateAction<GestionRealizada[]>
  >;
  completo: GestionCompleta[];
  completoAllData: GestionCompleta[];
  completoFilteredData: GestionCompleta[];
  completoLoading: boolean;
  completoError: string | null;
  completoPageNumber: number;
  completoPageSize: number;
  completoTotalRecords: number;
  completoTotalPages: number;
  completoTextFilters: TextFilters;
  completoSelectedFilters: SelectedFilters;
  setCompletoPageNumber: (page: number) => void;
  setCompletoPageSize: (size: number) => void;
  onCompletoTextFilterChange: (
    columnKey: string,
    value: string
  ) => void;
  onCompletoSelectedFilterChange: (
    columnKey: string,
    values: string[]
  ) => void;
  refetchCompleto: () => Promise<void>;
}
