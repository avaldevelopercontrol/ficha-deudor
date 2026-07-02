import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  useClientSideTable,
  type TextFilters,
  type SelectedFilters,
} from './useClientSideTable';

interface UseClientSideResourceTableParams<TData> {
  fetchData: () => Promise<TData[]>;
  resetDeps: readonly unknown[];
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
  onTextFilterChange: (columnKey: string, value: string) => void;
  onSelectedFilterChange: (columnKey: string, values: string[]) => void;
  resetFilters: () => void;
  setAllData: Dispatch<SetStateAction<TData[]>>;
  setError: (error: string | null) => void;
}

export function useClientSideResourceTable<TData>({
  fetchData,
  resetDeps,
  enabled = true,
  initialPageSize = 10,
  errorMessage,
}: UseClientSideResourceTableParams<TData>): UseClientSideResourceTableReturn<TData> {
  const [allData, setAllData] = useState<TData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const table = useClientSideTable<TData>(allData, resetDeps, {
    initialPageSize,
  });

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(
    async (isCancelled: () => boolean = () => false) => {
      if (isCancelled() || !isMountedRef.current) return;

      if (!enabled) {
        setAllData([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchData();

        if (isCancelled() || !isMountedRef.current) return;

        setAllData(result);
      } catch (err) {
        if (isCancelled() || !isMountedRef.current) return;

        setError(err instanceof Error ? err.message : errorMessage);
        setAllData([]);
      } finally {
        if (!isCancelled() && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [enabled, errorMessage, fetchData]
  );

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      void loadData(() => cancelled);
    });

    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const refetch = useCallback(() => {
    return loadData();
  }, [loadData]);

  return {
    allData,
    filteredData: table.filteredData,
    paginatedData: table.paginatedData,
    isLoading,
    error,
    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords: table.totalRecords,
    totalPages: table.totalPages,
    setPageNumber: table.setPageNumber,
    setPageSize: table.setPageSize,
    refetch,
    textFilters: table.textFilters,
    selectedFilters: table.selectedFilters,
    onTextFilterChange: table.onTextFilterChange,
    onSelectedFilterChange: table.onSelectedFilterChange,
    resetFilters: table.resetFilters,
    setAllData,
    setError,
  };
}