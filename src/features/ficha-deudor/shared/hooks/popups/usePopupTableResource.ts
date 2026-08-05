import {
  useCallback,
} from 'react';

import {
  useClientSideTable,
  type TextFilters,
  type SelectedFilters,
} from '@shared/hooks/useClientSideTable';
import {
  useAsyncResource,
  type AsyncResourceKeyPart,
} from '@shared/hooks/useAsyncResource';

export type { TextFilters, SelectedFilters };

export interface UsePopupTableResourceReturn<T> {
  allData: T[];
  filteredData: T[];
  paginatedData: T[];
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
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
}

interface UsePopupTableResourceParams<T> {
  areParamsReady: boolean;
  missingParamsError: string;
  loadError: string;
  resetDeps: readonly AsyncResourceKeyPart[];

  fetcher: (
    signal: AbortSignal
  ) => Promise<T[]>;

  initialPageSize?: number;
}

export const usePopupTableResource = <T,>({
  areParamsReady,
  missingParamsError,
  loadError,
  resetDeps,
  fetcher,
  initialPageSize = 10,
}: UsePopupTableResourceParams<T>): UsePopupTableResourceReturn<T> => {
  const resource = useAsyncResource<T[]>({
    loader: fetcher,
    resourceKey: resetDeps,
    initialData: [],
    errorMessage: loadError,
    enabled: areParamsReady,
    disabledError: missingParamsError,
  });

  const table = useClientSideTable(
    resource.data,
    resetDeps,
    {
      initialPageSize,
    }
  );

  const refetchResource = resource.refetch;

  const refetch = useCallback(() => {
    void refetchResource();
  }, [refetchResource]);

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
    refetch,
    textFilters: table.textFilters,
    selectedFilters:
      table.selectedFilters,

    onTextFilterChange:
      table.onTextFilterChange,

    onSelectedFilterChange:
      table.onSelectedFilterChange,

    resetFilters: table.resetFilters,
  };
};
