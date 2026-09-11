import { useCallback, useState } from 'react';

import type {
  PortfolioSortDirection,
} from '../domain/portfolioPromises.types';

interface UsePortfolioPromiseDetailTableStateParams<
  TFilter extends string,
  TSortKey extends string,
> {
  defaultFilter: TFilter;
  defaultSortKey: TSortKey;
  sortKeys: readonly TSortKey[];
  defaultSortDirection?: PortfolioSortDirection;
  defaultPageSize?: number;
}

export const isPortfolioPromiseSortKey = <TSortKey extends string>(
  key: string,
  sortKeys: readonly TSortKey[]
): key is TSortKey => sortKeys.some((sortKey) => sortKey === key);

export function usePortfolioPromiseDetailTableState<
  TFilter extends string,
  TSortKey extends string,
>({
  defaultFilter,
  defaultSortKey,
  sortKeys,
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
    if (!isPortfolioPromiseSortKey(key, sortKeys)) {
      return;
    }

    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  }, [sortKeys]);

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
