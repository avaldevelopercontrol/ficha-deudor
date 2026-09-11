import { useMemo } from 'react';

import type {
  PortfolioOperationalContext,
} from '../domain/portfolioOverview.types';
import type {
  PortfolioDueTodayPromisesData,
  PortfolioDueTodayPromisesQuery,
  PortfolioDueTodayPromisesSortKey,
  PortfolioDueTodayStatusFilter,
  PortfolioSortDirection,
} from '../domain/portfolioPromises.types';
import {
  buildPortfolioDueTodayPromisesQuery,
  loadPortfolioDueTodayPromises,
} from '../application/portfolioPromises.application';
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
    () =>
      buildPortfolioDueTodayPromisesQuery(
        page,
        pageSize,
        status,
        sortKey,
        sortDirection
      ),
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
