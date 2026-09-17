import {
  getLatestPortfolioCampaign,
  getPortfolioCampaignMonthOptions,
  getPortfolioCampaignYearOptions,
  getFiltroCarteraDateBounds,
  isUnidadNegocioCarteraTransitionPending,
  keepDateWithinBounds,
  switchUnidadNegocioCartera,
  type FiltroCarteraDateBounds,
} from '../domain/filtroCarteraContext';
import {
  buildFiltroCarteraIndex,
  hasIndexedSupervisorContext,
  isPortfolioCampaignAvailable,
  type FiltroCarteraIndex,
} from '../domain/filtroCarteraIndex';
import type {
  PortfolioCampaignFilterOption,
  CentroControlCarteraFilterOptions,
  CentroControlCarteraFilters,
  FiltroCarteraOption,
} from '../domain/filtrosCartera.types';

export const normalizeFiltroCarteraValue = (
  value: string
): string | null => (value === '' ? null : value);

const findAvailableCampaign = (
  index: FiltroCarteraIndex,
  campaignId: string | null,
  subPortfolioId: string | null
): PortfolioCampaignFilterOption | null => {
  if (!campaignId) {
    return null;
  }

  const campaign = index.campaignsById.get(campaignId) ?? null;

  return campaign &&
    isPortfolioCampaignAvailable(index, campaign.id, subPortfolioId)
    ? campaign
    : null;
};

export interface FiltrosCarteraViewModel {
  effectiveCampaign: PortfolioCampaignFilterOption | null;
  latestAvailableCampaign: PortfolioCampaignFilterOption | null;
  displayedCampaign: PortfolioCampaignFilterOption | null;
  isAutomaticCampaignSelectionPending: boolean;
  campaignYearOptions: FiltroCarteraOption[];
  selectedCampaignYear: number | null;
  campaignMonthOptions: FiltroCarteraOption[];
  subPortfolioOptions: FiltroCarteraOption[];
  businessUnitOptions: FiltroCarteraOption[];
  effectiveBusinessUnit: string | null;
  hasBusinessUnitCatalog: boolean;
  isBusinessUnitTransitionPending: boolean;
  dateBounds: FiltroCarteraDateBounds;
}

interface ResolveFiltrosCarteraViewModelParams {
  filters: CentroControlCarteraFilters;
  options: CentroControlCarteraFilterOptions;
  portfolioOption: FiltroCarteraOption | null;
  resolvedCampaignId: string | null;
}

export const resolveFiltrosCarteraViewModel = ({
  filters,
  options,
  portfolioOption,
  resolvedCampaignId,
}: ResolveFiltrosCarteraViewModelParams): FiltrosCarteraViewModel => {
  const index = buildFiltroCarteraIndex(options);
  const effectiveCampaign =
    findAvailableCampaign(
      index,
      filters.campaignId,
      null
    ) ??
    findAvailableCampaign(
      index,
      resolvedCampaignId,
      null
    );

  const campaignYearOptions = getPortfolioCampaignYearOptions(
    options,
    null,
    index
  );
  const latestAvailableCampaign =
    filters.campaignId === null && resolvedCampaignId === null
      ? getLatestPortfolioCampaign(
          options,
          null,
          null,
          index
        )
      : null;
  const displayedCampaign =
    effectiveCampaign ?? latestAvailableCampaign;
  const selectedCampaignYear =
    displayedCampaign?.year ??
    (campaignYearOptions[0]
      ? Number(campaignYearOptions[0].id)
      : null);
  const campaignMonthOptions = getPortfolioCampaignMonthOptions(
    options,
    selectedCampaignYear,
    null,
    index
  );
  const displayedCampaignId = displayedCampaign?.id ?? null;
  const subPortfolioOptions = options.subPortfolios.filter(
    (subPortfolio) =>
      displayedCampaignId !== null &&
      isPortfolioCampaignAvailable(
        index,
        displayedCampaignId,
        subPortfolio.id
      )
  );
  const hasBusinessUnitCatalog = options.businessUnits.length > 0;
  const businessUnitOptions = hasBusinessUnitCatalog
    ? [...options.businessUnits]
    : portfolioOption
      ? [portfolioOption]
      : [];
  const effectiveBusinessUnit =
    filters.businessUnit ??
    options.selectedBusinessUnit ??
    (!hasBusinessUnitCatalog ? portfolioOption?.id ?? null : null);

  return {
    effectiveCampaign,
    latestAvailableCampaign,
    displayedCampaign,
    isAutomaticCampaignSelectionPending:
      effectiveCampaign === null && latestAvailableCampaign !== null,
    campaignYearOptions,
    selectedCampaignYear,
    campaignMonthOptions,
    subPortfolioOptions,
    businessUnitOptions,
    effectiveBusinessUnit,
    hasBusinessUnitCatalog,
    isBusinessUnitTransitionPending:
      isUnidadNegocioCarteraTransitionPending(
        filters.businessUnit,
        options.selectedBusinessUnit
      ),
    dateBounds: getFiltroCarteraDateBounds(
      options,
      displayedCampaignId,
      filters.subPortfolioId,
      index
    ),
  };
};

export const resolveAutomaticPortfolioCampaignSelection = (
  filters: CentroControlCarteraFilters,
  options: CentroControlCarteraFilterOptions,
  latestAvailableCampaign: PortfolioCampaignFilterOption | null
): CentroControlCarteraFilters | null => {
  if (!latestAvailableCampaign) {
    return null;
  }

  const index = buildFiltroCarteraIndex(options);
  const subPortfolioId =
    filters.subPortfolioId &&
    isPortfolioCampaignAvailable(
      index,
      latestAvailableCampaign.id,
      filters.subPortfolioId
    )
      ? filters.subPortfolioId
      : null;
  const dateBounds = getFiltroCarteraDateBounds(
    options,
    latestAvailableCampaign.id,
    subPortfolioId,
    index
  );

  return {
    ...filters,
    campaignId: latestAvailableCampaign.id,
    subPortfolioId,
    dateFrom: keepDateWithinBounds(filters.dateFrom, dateBounds),
    dateTo: keepDateWithinBounds(filters.dateTo, dateBounds),
    supervisorId: null,
  };
};

export const changePortfolioSubPortfolio = (
  filters: CentroControlCarteraFilters,
  options: CentroControlCarteraFilterOptions,
  subPortfolioId: string | null
): CentroControlCarteraFilters => {
  const index = buildFiltroCarteraIndex(options);
  const campaignStillAvailable =
    !subPortfolioId ||
    !filters.campaignId ||
    isPortfolioCampaignAvailable(
      index,
      filters.campaignId,
      subPortfolioId
    );
  const supervisorStillAvailable =
    !subPortfolioId ||
    !filters.supervisorId ||
    hasIndexedSupervisorContext(
      index,
      filters.supervisorId,
      filters.campaignId,
      subPortfolioId
    );
  const campaignId = campaignStillAvailable
    ? filters.campaignId
    : null;
  const dateBounds = getFiltroCarteraDateBounds(
    options,
    campaignId,
    subPortfolioId,
    index
  );

  return {
    ...filters,
    dateFrom: keepDateWithinBounds(filters.dateFrom, dateBounds),
    dateTo: keepDateWithinBounds(filters.dateTo, dateBounds),
    subPortfolioId,
    campaignId,
    supervisorId: supervisorStillAvailable
      ? filters.supervisorId
      : null,
  };
};

export const changeUnidadNegocioCartera = (
  filters: CentroControlCarteraFilters,
  businessUnit: string | null,
  currentBusinessUnit: string | null
): CentroControlCarteraFilters | null => {
  if (!businessUnit || businessUnit === currentBusinessUnit) {
    return null;
  }

  return switchUnidadNegocioCartera(filters, businessUnit);
};

const changePortfolioCampaignWithIndex = (
  filters: CentroControlCarteraFilters,
  options: CentroControlCarteraFilterOptions,
  campaignId: string | null,
  index: FiltroCarteraIndex
): CentroControlCarteraFilters => {
  const subPortfolioId =
    !campaignId ||
    !filters.subPortfolioId ||
    isPortfolioCampaignAvailable(
      index,
      campaignId,
      filters.subPortfolioId
    )
      ? filters.subPortfolioId
      : null;
  const supervisorStillAvailable =
    !campaignId ||
    !filters.supervisorId ||
    hasIndexedSupervisorContext(
      index,
      filters.supervisorId,
      campaignId,
      subPortfolioId
    );
  const dateBounds = getFiltroCarteraDateBounds(
    options,
    campaignId,
    subPortfolioId,
    index
  );

  return {
    ...filters,
    dateFrom: keepDateWithinBounds(filters.dateFrom, dateBounds),
    dateTo: keepDateWithinBounds(filters.dateTo, dateBounds),
    subPortfolioId,
    campaignId,
    supervisorId: supervisorStillAvailable
      ? filters.supervisorId
      : null,
  };
};

export const changePortfolioCampaign = (
  filters: CentroControlCarteraFilters,
  options: CentroControlCarteraFilterOptions,
  campaignId: string | null
): CentroControlCarteraFilters =>
  changePortfolioCampaignWithIndex(
    filters,
    options,
    campaignId,
    buildFiltroCarteraIndex(options)
  );

export const changePortfolioCampaignYear = (
  filters: CentroControlCarteraFilters,
  options: CentroControlCarteraFilterOptions,
  campaignYear: number | null
): CentroControlCarteraFilters => {
  const index = buildFiltroCarteraIndex(options);
  const latestCampaign =
    campaignYear === null
      ? null
      : getLatestPortfolioCampaign(
          options,
          null,
          campaignYear,
          index
        );

  return changePortfolioCampaignWithIndex(
    filters,
    options,
    latestCampaign?.id ?? null,
    index
  );
};
