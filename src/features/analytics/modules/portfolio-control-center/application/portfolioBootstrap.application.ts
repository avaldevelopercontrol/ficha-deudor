import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
} from '../domain/portfolioFilters.types';
import type {
  PortfolioControlCenterData,
} from '../domain/portfolioOverview.types';
import {
  loadPortfolioControlCenter,
  loadPortfolioControlCenterBootstrap,
  type PortfolioControlCenterBootstrapData,
} from './portfolioOverview.application';

export interface PortfolioBootstrapSession {
  filterOptionsLoaded: boolean;
  forceBootstrap: boolean;
  selectedBusinessUnit: string | null;
  currentCampaignUnavailable: boolean;
}

export interface PortfolioControlCenterLoadResult {
  data: PortfolioControlCenterData | null;
  filterOptions: PortfolioControlCenterFilterOptions | null;
}

export type PortfolioControlCenterLoadMode = 'bootstrap' | 'overview';

const normalizeBusinessUnit = (
  businessUnit: string | null
): string | null => businessUnit?.trim() || null;

const isSameBusinessUnit = (left: string, right: string): boolean =>
  left.localeCompare(right, undefined, {
    sensitivity: 'accent',
  }) === 0;

export const createPortfolioBootstrapSession =
  (): PortfolioBootstrapSession => ({
    filterOptionsLoaded: false,
    forceBootstrap: false,
    selectedBusinessUnit: null,
    currentCampaignUnavailable: false,
  });

export const requestPortfolioBootstrap = (
  session: PortfolioBootstrapSession
): void => {
  session.forceBootstrap = true;
};

export const resolvePortfolioControlCenterLoadMode = (
  session: PortfolioBootstrapSession,
  filters: PortfolioControlCenterFilters
): PortfolioControlCenterLoadMode => {
  if (!session.filterOptionsLoaded || session.forceBootstrap) {
    return 'bootstrap';
  }

  const requested = normalizeBusinessUnit(filters.businessUnit);
  const selected = normalizeBusinessUnit(
    session.selectedBusinessUnit
  );

  if (
    requested !== null &&
    (selected === null || !isSameBusinessUnit(requested, selected))
  ) {
    return 'bootstrap';
  }

  if (
    session.currentCampaignUnavailable &&
    !filters.campaignId?.trim()
  ) {
    return 'bootstrap';
  }

  return 'overview';
};

export const getPortfolioControlCenterResourceKey = (
  crmClientId: number,
  filters: PortfolioControlCenterFilters
) => [
  crmClientId,
  filters.businessUnit,
  filters.dateFrom,
  filters.dateTo,
  filters.subPortfolioId,
  filters.campaignId,
  filters.supervisorId,
] as const;

const commitPortfolioBootstrap = (
  session: PortfolioBootstrapSession,
  filters: PortfolioControlCenterFilters,
  bootstrap: PortfolioControlCenterBootstrapData
): void => {
  session.filterOptionsLoaded = true;
  session.selectedBusinessUnit =
    bootstrap.filterOptions.selectedBusinessUnit;

  if (
    filters.campaignId === null &&
    filters.subPortfolioId === null
  ) {
    session.currentCampaignUnavailable = bootstrap.data === null;
  }
};

export const loadPortfolioControlCenterResource = async (
  crmClientId: number,
  filters: PortfolioControlCenterFilters,
  session: PortfolioBootstrapSession,
  signal: AbortSignal
): Promise<PortfolioControlCenterLoadResult> => {
  const loadMode = resolvePortfolioControlCenterLoadMode(
    session,
    filters
  );
  session.forceBootstrap = false;

  if (loadMode === 'bootstrap') {
    const bootstrap = await loadPortfolioControlCenterBootstrap(
      crmClientId,
      filters,
      signal
    );

    if (!signal.aborted) {
      commitPortfolioBootstrap(session, filters, bootstrap);
    }

    return {
      data: bootstrap.data,
      filterOptions: bootstrap.filterOptions,
    };
  }

  return {
    data: await loadPortfolioControlCenter(
      crmClientId,
      {
        ...filters,
        businessUnit:
          filters.businessUnit ?? session.selectedBusinessUnit,
      },
      signal
    ),
    filterOptions: null,
  };
};
