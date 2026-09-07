import { useMemo } from 'react';

import type {
  PortfolioDueTodayPromisesData,
  PortfolioDueTodayPromisesQuery,
  PortfolioDueTodayPromisesSortKey,
  PortfolioDueTodayStatusFilter,
  PortfolioOperationalContext,
  PortfolioSortDirection,
} from '../../../types/portfolioControlCenter.types';
import { loadPortfolioDueTodayPromises } from '../services/portfolioControlCenter.service';
import { usePortfolioPromiseDetailResource } from './usePortfolioPromiseDetailResource';

interface UsePortfolioDueTodayPromisesParams {
  crmClientId: number;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > | null;
  enabled: boolean;
  page: number;
  pageSize: number;
  status: PortfolioDueTodayStatusFilter;
  sortKey: PortfolioDueTodayPromisesSortKey;
  sortDirection: PortfolioSortDirection;
}

export const usePortfolioDueTodayPromises = ({
  crmClientId,
  context,
  enabled,
  page,
  pageSize,
  status,
  sortKey,
  sortDirection,
}: UsePortfolioDueTodayPromisesParams) => {
  const query = useMemo<PortfolioDueTodayPromisesQuery>(
    () => ({
      page,
      pageSize,
      status: status === 'all' ? null : status,
      sortBy: sortKey,
      sortDirection,
    }),
    [status, page, pageSize, sortDirection, sortKey]
  );

  return usePortfolioPromiseDetailResource<
    PortfolioDueTodayPromisesData,
    PortfolioDueTodayPromisesQuery
  >({
    crmClientId,
    context,
    enabled,
    query,
    queryKey: [page, pageSize, status, sortKey, sortDirection],
    load: loadPortfolioDueTodayPromises,
    errorMessage:
      'No se pudo cargar el detalle de promesas con vencimiento hoy.',
  });
};
