import type {
  SelectedFilters,
  TextFilters,
} from '@shared/hooks/useClientSideTable';
import type {
  EstadoGestion,
  EstadoGestionCompleta,
} from './estadoGestion.types';

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
  onTextFilterChange: (
    columnKey: string,
    value: string
  ) => void;
  onSelectedFilterChange: (
    columnKey: string,
    values: string[]
  ) => void;
  completo: EstadoGestionCompleta[];
  completoAllData: EstadoGestionCompleta[];
  completoFilteredData: EstadoGestionCompleta[];
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
