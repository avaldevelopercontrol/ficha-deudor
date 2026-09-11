import { useMemo } from 'react';

import type {
  PortfolioOperationalContext,
} from '../domain/portfolioOverview.types';
import type {
  PortfolioOverdueAgingFilter,
  PortfolioOverduePromisesData,
  PortfolioOverduePromisesQuery,
  PortfolioOverduePromisesSortKey,
  PortfolioSortDirection,
} from '../domain/portfolioPromises.types';
import {
  buildPortfolioOverduePromisesQuery,
  loadPortfolioOverduePromises,
} from '../application/portfolioPromises.application';
import { usePortfolioPromiseDetailResource } from './usePortfolioPromiseDetailResource';

interface UsePortfolioOverduePromisesParams {
  crmClientId: number;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > | null;
  enabled: boolean;
  page: number;
  pageSize: number;
  aging: PortfolioOverdueAgingFilter;
  sortKey: PortfolioOverduePromisesSortKey;
  sortDirection: PortfolioSortDirection;
}

export const usePortfolioOverduePromises = ({
  crmClientId,
  context,
  enabled,
  page,
  pageSize,
  aging,
  sortKey,
  sortDirection,
}: UsePortfolioOverduePromisesParams) => {
  const query = useMemo<PortfolioOverduePromisesQuery>(
    () =>
      buildPortfolioOverduePromisesQuery(
        page,
        pageSize,
        aging,
        sortKey,
        sortDirection
      ),
    [aging, page, pageSize, sortDirection, sortKey]
  );

  return usePortfolioPromiseDetailResource<
    PortfolioOverduePromisesData,
    PortfolioOverduePromisesQuery
  >({
    crmClientId,
    context,
    enabled,
    query,
    queryKey: [page, pageSize, aging, sortKey, sortDirection],
    load: loadPortfolioOverduePromises,
    errorMessage: 'No se pudo cargar el detalle de promesas vencidas.',
  });
};
