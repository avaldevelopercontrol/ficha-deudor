import { useCallback, useState } from 'react';

import type {
  PortfolioSortDirection,
} from '../../../types/portfolioControlCenter.types';

interface UsePortfolioPromiseDetailTableStateParams<
  TFilter extends string,
  TSortKey extends string,
> {
  defaultFilter: TFilter;
  defaultSortKey: TSortKey;
  defaultSortDirection?: PortfolioSortDirection;
  defaultPageSize?: number;
}

export function usePortfolioPromiseDetailTableState<
  TFilter extends string,
  TSortKey extends string,
>({
  defaultFilter,
  defaultSortKey,
  defaultSortDirection = 'desc',
  defaultPageSize = 5,
}: UsePortfolioPromiseDetailTableStateParams<TFilter, TSortKey>) {
  const [filter, setFilter] = useState<TFilter>(defaultFilter);
  const [sortKey, setSortKey] = useState<TSortKey>(defaultSortKey);
  const [sortDirection, setSortDirection] =
    useState<PortfolioSortDirection>(defaultSortDirection);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const handleFilterChange = useCallback((nextFilter: TFilter) => {
    setFilter(nextFilter);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((
    key: string,
    direction: PortfolioSortDirection
  ) => {
    setSortKey(key as TSortKey);
    setSortDirection(direction);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setFilter(defaultFilter);
    setSortKey(defaultSortKey);
    setSortDirection(defaultSortDirection);
    setPage(1);
    setPageSize(defaultPageSize);
  }, [
    defaultFilter,
    defaultPageSize,
    defaultSortDirection,
    defaultSortKey,
  ]);

  return {
    filter,
    sortKey,
    sortDirection,
    page,
    pageSize,
    setPage,
    handleFilterChange,
    handleSortChange,
    handlePageSizeChange,
    reset,
  };
}
