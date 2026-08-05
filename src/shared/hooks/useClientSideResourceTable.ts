import {
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  useClientSideTable,
  type TextFilters,
  type SelectedFilters,
} from './useClientSideTable';
import {
  useAsyncResource,
  type AsyncResourceKeyPart,
} from './useAsyncResource';

interface UseClientSideResourceTableParams<TData> {
  fetchData: (
    signal: AbortSignal
  ) => Promise<TData[]>;
  resetDeps: readonly AsyncResourceKeyPart[];
  enabled?: boolean;
  initialPageSize?: number;
  errorMessage: string;
}

interface UseClientSideResourceTableReturn<TData> {
  allData: TData[];
  filteredData: TData[];
  paginatedData: TData[];
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
  resetFilters: () => void;
  setAllData: Dispatch<
    SetStateAction<TData[]>
  >;
  setError: (
    error: string | null
  ) => void;
}

export function useClientSideResourceTable<TData>({
  fetchData,
  resetDeps,
  enabled = true,
  initialPageSize = 10,
  errorMessage,
}: UseClientSideResourceTableParams<TData>): UseClientSideResourceTableReturn<TData> {
  const resource = useAsyncResource<TData[]>({
    loader: fetchData,
    resourceKey: resetDeps,
    initialData: [],
    errorMessage,
    enabled,
  });

  const table = useClientSideTable<TData>(
    resource.data,
    resetDeps,
    {
      initialPageSize,
    }
  );

  return {
    allData: resource.data,
    filteredData: table.filteredData,
    paginatedData: table.paginatedData,
    isLoading: resource.isLoading,
    error: resource.error,
    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords: table.totalRecords,
    totalPages: table.totalPages,
    setPageNumber: table.setPageNumber,
    setPageSize: table.setPageSize,
    refetch: resource.refetch,
    textFilters: table.textFilters,
    selectedFilters: table.selectedFilters,
    onTextFilterChange: table.onTextFilterChange,
    onSelectedFilterChange:
      table.onSelectedFilterChange,
    resetFilters: table.resetFilters,
    setAllData: resource.setData,
    setError: resource.setError,
  };
}
