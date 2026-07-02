import { useCallback, useEffect, useState } from 'react';

interface ServerSideResourceResult<TData> {
  data: TData[];
  totalRecords: number;
  totalPages: number;
}

interface UseServerSideResourceTableParams<TData> {
  fetchData: (
    pageNumber: number,
    pageSize: number
  ) => Promise<ServerSideResourceResult<TData>>;
  enabled?: boolean;
  initialPageNumber?: number;
  initialPageSize?: number;
  errorMessage: string;
}

interface UseServerSideResourceTableReturn<TData> {
  data: TData[];
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => Promise<void>;
}

export function useServerSideResourceTable<TData>({
  fetchData,
  enabled = true,
  initialPageNumber = 1,
  initialPageSize = 10,
  errorMessage,
}: UseServerSideResourceTableParams<TData>): UseServerSideResourceTableReturn<TData> {
  const [data, setData] = useState<TData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumberState] = useState(initialPageNumber);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(
    async (isCancelled: () => boolean = () => false) => {
      if (isCancelled()) return;

      if (!enabled) {
        setData([]);
        setIsLoading(false);
        setError(null);
        setTotalRecords(0);
        setTotalPages(1);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchData(pageNumber, pageSize);

        if (isCancelled()) return;

        setData(result.data);
        setTotalRecords(result.totalRecords);
        setTotalPages(result.totalPages);
      } catch (err) {
        if (isCancelled()) return;

        setError(err instanceof Error ? err.message : errorMessage);
        setData([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        if (!isCancelled()) {
          setIsLoading(false);
        }
      }
    },
    [enabled, errorMessage, fetchData, pageNumber, pageSize]
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

  const setPageNumber = useCallback((page: number) => {
    setPageNumberState(page);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPageNumberState(1);
  }, []);

  const refetch = useCallback(() => {
    return loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber,
    setPageSize,
    refetch,
  };
}