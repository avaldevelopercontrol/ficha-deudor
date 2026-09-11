import {
  fetchPortfolioControlCenterBootstrap,
  fetchPortfolioControlCenterOverview,
} from '../api/portfolioControlCenterApi';
import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
} from '../domain/portfolioFilters.types';
import type {
  PortfolioControlCenterData,
} from '../domain/portfolioOverview.types';
import { mapPortfolioFilterOptionsResponse } from '../mappers/portfolioFilters.mapper';
import { mapPortfolioOverviewResponse } from '../mappers/portfolioOverview.mapper';

export interface PortfolioControlCenterBootstrapData {
  data: PortfolioControlCenterData | null;
  filterOptions: PortfolioControlCenterFilterOptions;
}

const assertGlobalFiltersSupported = (
  filters: PortfolioControlCenterFilters
): void => {
  if (filters.supervisorId) {
    throw new Error(
      'Supervisor permanece restringido como filtro global porque los KPIs superiores no tienen una semántica canonical atribuible a supervisor.'
    );
  }
};

export const loadPortfolioControlCenterBootstrap = async (
  crmClientId: number,
  filters: PortfolioControlCenterFilters,
  signal: AbortSignal
): Promise<PortfolioControlCenterBootstrapData> => {
  assertGlobalFiltersSupported(filters);

  const response = await fetchPortfolioControlCenterBootstrap(
    crmClientId,
    filters,
    signal
  );
  const filterOptions = mapPortfolioFilterOptionsResponse(
    response.filterOptions
  );

  return {
    data:
      response.overview === null
        ? null
        : mapPortfolioOverviewResponse(
            response.overview,
            filters.subPortfolioId,
            filterOptions.selectedBusinessUnit
          ),
    filterOptions,
  };
};

export const loadPortfolioControlCenter = async (
  crmClientId: number,
  filters: PortfolioControlCenterFilters,
  signal: AbortSignal
): Promise<PortfolioControlCenterData> => {
  assertGlobalFiltersSupported(filters);

  const response = await fetchPortfolioControlCenterOverview(
    crmClientId,
    filters,
    signal
  );

  return mapPortfolioOverviewResponse(
    response,
    filters.subPortfolioId,
    filters.businessUnit
  );
};
