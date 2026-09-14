import type {
  CentroControlCarteraFilterOptions,
  CentroControlCarteraFilters,
} from '../domain/filtrosCartera.types';
import type {
  CentroControlCarteraData,
} from '../domain/panoramaCartera.types';
import {
  loadCentroControlCartera,
  loadCentroControlCarteraBootstrap,
  type CentroControlCarteraBootstrapData,
} from './panoramaCartera.application';

export interface InicializacionCarteraSession {
  filterOptionsLoaded: boolean;
  forceBootstrap: boolean;
  selectedBusinessUnit: string | null;
  currentCampaignUnavailable: boolean;
}

export interface CentroControlCarteraLoadResult {
  data: CentroControlCarteraData | null;
  filterOptions: CentroControlCarteraFilterOptions | null;
}

export type CentroControlCarteraLoadMode = 'bootstrap' | 'overview';

const normalizeBusinessUnit = (
  businessUnit: string | null
): string | null => businessUnit?.trim() || null;

const isSameBusinessUnit = (left: string, right: string): boolean =>
  left.localeCompare(right, undefined, {
    sensitivity: 'accent',
  }) === 0;

export const createInicializacionCarteraSession =
  (): InicializacionCarteraSession => ({
    filterOptionsLoaded: false,
    forceBootstrap: false,
    selectedBusinessUnit: null,
    currentCampaignUnavailable: false,
  });

export const requestInicializacionCartera = (
  session: InicializacionCarteraSession
): void => {
  session.forceBootstrap = true;
};

export const resolveCentroControlCarteraLoadMode = (
  session: InicializacionCarteraSession,
  filters: CentroControlCarteraFilters
): CentroControlCarteraLoadMode => {
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

export const getCentroControlCarteraResourceKey = (
  crmClientId: number,
  filters: CentroControlCarteraFilters
) => [
  crmClientId,
  filters.businessUnit,
  filters.dateFrom,
  filters.dateTo,
  filters.subPortfolioId,
  filters.campaignId,
  filters.supervisorId,
] as const;

const commitInicializacionCartera = (
  session: InicializacionCarteraSession,
  filters: CentroControlCarteraFilters,
  bootstrap: CentroControlCarteraBootstrapData
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

export const loadCentroControlCarteraResource = async (
  crmClientId: number,
  filters: CentroControlCarteraFilters,
  session: InicializacionCarteraSession,
  signal: AbortSignal
): Promise<CentroControlCarteraLoadResult> => {
  const loadMode = resolveCentroControlCarteraLoadMode(
    session,
    filters
  );
  session.forceBootstrap = false;

  if (loadMode === 'bootstrap') {
    const bootstrap = await loadCentroControlCarteraBootstrap(
      crmClientId,
      filters,
      signal
    );

    if (!signal.aborted) {
      commitInicializacionCartera(session, filters, bootstrap);
    }

    return {
      data: bootstrap.data,
      filterOptions: bootstrap.filterOptions,
    };
  }

  return {
    data: await loadCentroControlCartera(
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
