import {
  getLatestPortfolioCampaign,
  getPortfolioCampaignMonthOptions,
  getPortfolioCampaignYearOptions,
  getPortfolioFilterDateBounds,
  isPortfolioBusinessUnitTransitionPending,
  keepDateWithinBounds,
  switchPortfolioBusinessUnit,
  type PortfolioFilterDateBounds,
} from '../domain/portfolioFilterContext';
import {
  buildPortfolioFilterIndex,
  hasIndexedSupervisorContext,
  isPortfolioCampaignAvailable,
  type PortfolioFilterIndex,
} from '../domain/portfolioFilterIndex';
import type {
  PortfolioCampaignFilterOption,
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
  PortfolioFilterOption,
} from '../domain/portfolioFilters.types';

export const normalizePortfolioFilterValue = (
  value: string
): string | null => (value === '' ? null : value);

const findAvailableCampaign = (
  index: PortfolioFilterIndex,
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

export interface PortfolioFiltersViewModel {
  effectiveCampaign: PortfolioCampaignFilterOption | null;
  latestAvailableCampaign: PortfolioCampaignFilterOption | null;
  displayedCampaign: PortfolioCampaignFilterOption | null;
  isAutomaticCampaignSelectionPending: boolean;
  campaignYearOptions: PortfolioFilterOption[];
  selectedCampaignYear: number | null;
  campaignMonthOptions: PortfolioFilterOption[];
  subPortfolioOptions: PortfolioFilterOption[];
  businessUnitOptions: PortfolioFilterOption[];
  effectiveBusinessUnit: string | null;
  hasBusinessUnitCatalog: boolean;
  isBusinessUnitTransitionPending: boolean;
  dateBounds: PortfolioFilterDateBounds;
}

interface ResolvePortfolioFiltersViewModelParams {
  filters: PortfolioControlCenterFilters;
  options: PortfolioControlCenterFilterOptions;
  portfolioOption: PortfolioFilterOption | null;
  resolvedCampaignId: string | null;
}

export const resolvePortfolioFiltersViewModel = ({
  filters,
  options,
  portfolioOption,
  resolvedCampaignId,
}: ResolvePortfolioFiltersViewModelParams): PortfolioFiltersViewModel => {
  const index = buildPortfolioFilterIndex(options);
  const effectiveCampaign =
    findAvailableCampaign(
      index,
      filters.campaignId,
      filters.subPortfolioId
    ) ??
    findAvailableCampaign(
      index,
      resolvedCampaignId,
      filters.subPortfolioId
    );

  const campaignYearOptions = getPortfolioCampaignYearOptions(
    options,
    filters.subPortfolioId,
    index
  );
  const latestAvailableCampaign =
    filters.campaignId === null && resolvedCampaignId === null
      ? getLatestPortfolioCampaign(
          options,
          filters.subPortfolioId,
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
    filters.subPortfolioId,
    index
  );
  const subPortfolioOptions = options.subPortfolios.filter(
    (subPortfolio) =>
      !filters.campaignId ||
      isPortfolioCampaignAvailable(
        index,
        filters.campaignId,
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
      isPortfolioBusinessUnitTransitionPending(
        filters.businessUnit,
        options.selectedBusinessUnit
      ),
    dateBounds: getPortfolioFilterDateBounds(
      options,
      filters.campaignId,
      filters.subPortfolioId,
      index
    ),
  };
};

export const resolveAutomaticPortfolioCampaignSelection = (
  filters: PortfolioControlCenterFilters,
  options: PortfolioControlCenterFilterOptions,
  latestAvailableCampaign: PortfolioCampaignFilterOption | null
): PortfolioControlCenterFilters | null => {
  if (!latestAvailableCampaign) {
    return null;
  }

  const index = buildPortfolioFilterIndex(options);
  const dateBounds = getPortfolioFilterDateBounds(
    options,
    latestAvailableCampaign.id,
    filters.subPortfolioId,
    index
  );

  return {
    ...filters,
    campaignId: latestAvailableCampaign.id,
    dateFrom: keepDateWithinBounds(filters.dateFrom, dateBounds),
    dateTo: keepDateWithinBounds(filters.dateTo, dateBounds),
    supervisorId: null,
  };
};

export const changePortfolioSubPortfolio = (
  filters: PortfolioControlCenterFilters,
  options: PortfolioControlCenterFilterOptions,
  subPortfolioId: string | null
): PortfolioControlCenterFilters => {
  const index = buildPortfolioFilterIndex(options);
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
  const dateBounds = getPortfolioFilterDateBounds(
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

export const changePortfolioBusinessUnit = (
  filters: PortfolioControlCenterFilters,
  businessUnit: string | null,
  currentBusinessUnit: string | null
): PortfolioControlCenterFilters | null => {
  if (!businessUnit || businessUnit === currentBusinessUnit) {
    return null;
  }

  return switchPortfolioBusinessUnit(filters, businessUnit);
};

const changePortfolioCampaignWithIndex = (
  filters: PortfolioControlCenterFilters,
  options: PortfolioControlCenterFilterOptions,
  campaignId: string | null,
  index: PortfolioFilterIndex
): PortfolioControlCenterFilters => {
  const supervisorStillAvailable =
    !campaignId ||
    !filters.supervisorId ||
    hasIndexedSupervisorContext(
      index,
      filters.supervisorId,
      campaignId,
      filters.subPortfolioId
    );
  const dateBounds = getPortfolioFilterDateBounds(
    options,
    campaignId,
    filters.subPortfolioId,
    index
  );

  return {
    ...filters,
    dateFrom: keepDateWithinBounds(filters.dateFrom, dateBounds),
    dateTo: keepDateWithinBounds(filters.dateTo, dateBounds),
    campaignId,
    supervisorId: supervisorStillAvailable
      ? filters.supervisorId
      : null,
  };
};

export const changePortfolioCampaign = (
  filters: PortfolioControlCenterFilters,
  options: PortfolioControlCenterFilterOptions,
  campaignId: string | null
): PortfolioControlCenterFilters =>
  changePortfolioCampaignWithIndex(
    filters,
    options,
    campaignId,
    buildPortfolioFilterIndex(options)
  );

export const changePortfolioCampaignYear = (
  filters: PortfolioControlCenterFilters,
  options: PortfolioControlCenterFilterOptions,
  campaignYear: number | null
): PortfolioControlCenterFilters => {
  const index = buildPortfolioFilterIndex(options);
  const latestCampaign =
    campaignYear === null
      ? null
      : getLatestPortfolioCampaign(
          options,
          filters.subPortfolioId,
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
