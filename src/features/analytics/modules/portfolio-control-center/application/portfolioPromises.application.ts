import {
  fetchPortfolioDueTodayPromises,
  fetchPortfolioOverduePromises,
} from '../api/portfolioControlCenterApi';
import type {
  PortfolioOperationalContext,
} from '../domain/portfolioOverview.types';
import type {
  PortfolioDueTodayPromisesData,
  PortfolioDueTodayPromisesQuery,
  PortfolioDueTodayPromisesSortKey,
  PortfolioDueTodayStatusFilter,
  PortfolioOverdueAgingFilter,
  PortfolioOverduePromisesData,
  PortfolioOverduePromisesQuery,
  PortfolioOverduePromisesSortKey,
  PortfolioSortDirection,
} from '../domain/portfolioPromises.types';
import {
  mapPortfolioDueTodayPromisesResponse,
  mapPortfolioOverduePromisesResponse,
} from '../mappers/portfolioPromises.mapper';

export type PortfolioPromiseDetailContext = Pick<
  PortfolioOperationalContext,
  'businessUnit' | 'campaignId' | 'subPortfolioId'
>;

export const buildPortfolioOverduePromisesQuery = (
  page: number,
  pageSize: number,
  aging: PortfolioOverdueAgingFilter,
  sortBy: PortfolioOverduePromisesSortKey,
  sortDirection: PortfolioSortDirection
): PortfolioOverduePromisesQuery => ({
  page,
  pageSize,
  aging: aging === 'all' ? null : aging,
  sortBy,
  sortDirection,
});

export const buildPortfolioDueTodayPromisesQuery = (
  page: number,
  pageSize: number,
  status: PortfolioDueTodayStatusFilter,
  sortBy: PortfolioDueTodayPromisesSortKey,
  sortDirection: PortfolioSortDirection
): PortfolioDueTodayPromisesQuery => ({
  page,
  pageSize,
  status: status === 'all' ? null : status,
  sortBy,
  sortDirection,
});

export const loadPortfolioOverduePromises = async (
  crmClientId: number,
  context: PortfolioPromiseDetailContext,
  query: PortfolioOverduePromisesQuery,
  signal: AbortSignal
): Promise<PortfolioOverduePromisesData> => {
  const response = await fetchPortfolioOverduePromises(
    crmClientId,
    context,
    query,
    signal
  );

  return mapPortfolioOverduePromisesResponse(response);
};

export const loadPortfolioDueTodayPromises = async (
  crmClientId: number,
  context: PortfolioPromiseDetailContext,
  query: PortfolioDueTodayPromisesQuery,
  signal: AbortSignal
): Promise<PortfolioDueTodayPromisesData> => {
  const response = await fetchPortfolioDueTodayPromises(
    crmClientId,
    context,
    query,
    signal
  );

  return mapPortfolioDueTodayPromisesResponse(response);
};
