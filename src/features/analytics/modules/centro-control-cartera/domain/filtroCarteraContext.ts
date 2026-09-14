import {
  buildFiltroCarteraIndex,
  getIndexedSubPortfolioCampaignAvailability,
  getIndexedSupervisorIds,
  isPortfolioCampaignAvailable,
  type FiltroCarteraIndex,
} from './filtroCarteraIndex';
import type {
  PortfolioCampaignFilterOption,
  CentroControlCarteraFilters,
  CentroControlCarteraFilterOptions,
  FiltroCarteraOption,
  PortfolioSupervisorFilterOption,
} from './filtrosCartera.types';

export const PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID =
  '__unassigned__';

export interface FiltroCarteraDateBounds {
  min: string | null;
  max: string | null;
}

export const switchUnidadNegocioCartera = (
  filters: CentroControlCarteraFilters,
  businessUnit: string
): CentroControlCarteraFilters => {
  const normalizedBusinessUnit = businessUnit.trim();

  return {
    ...filters,
    businessUnit:
      normalizedBusinessUnit.length > 0
        ? normalizedBusinessUnit
        : null,
    dateFrom: null,
    dateTo: null,
    subPortfolioId: null,
    campaignId: null,
    supervisorId: null,
  };
};

export const isUnidadNegocioCarteraTransitionPending = (
  requestedBusinessUnit: string | null,
  loadedBusinessUnit: string | null
): boolean => {
  const requested = requestedBusinessUnit?.trim() || null;
  const loaded = loadedBusinessUnit?.trim() || null;

  return requested !== null && requested !== loaded;
};

const PORTFOLIO_CAMPAIGN_MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

const compareCampaignRecency = (
  left: PortfolioCampaignFilterOption,
  right: PortfolioCampaignFilterOption
): number => {
  if (left.startDate !== right.startDate) {
    return left.startDate.localeCompare(right.startDate);
  }

  return left.id.localeCompare(right.id);
};

export const getLatestPortfolioCampaign = (
  options: CentroControlCarteraFilterOptions,
  subPortfolioId: string | null = null,
  campaignYear: number | null = null,
  index: FiltroCarteraIndex = buildFiltroCarteraIndex(options)
): PortfolioCampaignFilterOption | null => {
  const campaigns = subPortfolioId
    ? index.campaignsBySubPortfolio.get(subPortfolioId) ?? []
    : options.campaigns;

  return campaigns.reduce<PortfolioCampaignFilterOption | null>(
    (latest, campaign) => {
      if (campaignYear !== null && campaign.year !== campaignYear) {
        return latest;
      }

      if (!latest) {
        return campaign;
      }

      return compareCampaignRecency(campaign, latest) > 0
        ? campaign
        : latest;
    },
    null
  );
};

const getPortfolioCampaignsForContext = (
  options: CentroControlCarteraFilterOptions,
  subPortfolioId: string | null,
  index: FiltroCarteraIndex
): readonly PortfolioCampaignFilterOption[] =>
  subPortfolioId
    ? index.campaignsBySubPortfolio.get(subPortfolioId) ?? []
    : options.campaigns;

export const getPortfolioCampaignYearOptions = (
  options: CentroControlCarteraFilterOptions,
  subPortfolioId: string | null = null,
  index: FiltroCarteraIndex = buildFiltroCarteraIndex(options)
): FiltroCarteraOption[] => {
  const years = new Set(
    getPortfolioCampaignsForContext(
      options,
      subPortfolioId,
      index
    ).map((campaign) => campaign.year)
  );

  return [...years]
    .sort((left, right) => right - left)
    .map((year) => ({
      id: String(year),
      label: String(year),
    }));
};

export const getPortfolioCampaignMonthOptions = (
  options: CentroControlCarteraFilterOptions,
  campaignYear: number | null,
  subPortfolioId: string | null = null,
  index: FiltroCarteraIndex = buildFiltroCarteraIndex(options)
): FiltroCarteraOption[] => {
  if (campaignYear === null) {
    return [];
  }

  const campaigns = getPortfolioCampaignsForContext(
    options,
    subPortfolioId,
    index
  )
    .filter((campaign) => campaign.year === campaignYear)
    .sort((left, right) => {
      if (left.month !== right.month) {
        return right.month - left.month;
      }

      return compareCampaignRecency(right, left);
    });

  const campaignCountByMonth = campaigns.reduce<
    Map<number, number>
  >((countByMonth, campaign) => {
    countByMonth.set(
      campaign.month,
      (countByMonth.get(campaign.month) ?? 0) + 1
    );

    return countByMonth;
  }, new Map());

  return campaigns.map((campaign) => {
    const monthLabel =
      PORTFOLIO_CAMPAIGN_MONTH_LABELS[
        campaign.month - 1
      ] ?? `Mes ${campaign.month}`;

    return {
      id: campaign.id,
      label:
        (campaignCountByMonth.get(campaign.month) ?? 0) > 1
          ? `${monthLabel} — ${campaign.label}`
          : monthLabel,
    };
  });
};

export const getFiltroCarteraDateBounds = (
  options: CentroControlCarteraFilterOptions,
  campaignId: string | null,
  subPortfolioId: string | null = null,
  index: FiltroCarteraIndex = buildFiltroCarteraIndex(options)
): FiltroCarteraDateBounds => {
  const indexedCampaign = campaignId
    ? index.campaignsById.get(campaignId) ?? null
    : null;
  const selectedCampaign =
    indexedCampaign &&
    isPortfolioCampaignAvailable(
      index,
      indexedCampaign.id,
      subPortfolioId
    )
      ? indexedCampaign
      : null;

  const effectiveCampaign =
    selectedCampaign ??
    getLatestPortfolioCampaign(
      options,
      subPortfolioId,
      null,
      index
    );

  if (effectiveCampaign) {
    const portfolioAvailability =
      getIndexedSubPortfolioCampaignAvailability(
        index,
        subPortfolioId,
        effectiveCampaign.id
      );

    return {
      min:
        portfolioAvailability?.availableDateFrom ??
        effectiveCampaign.availableDateFrom,
      max:
        portfolioAvailability?.availableDateTo ??
        effectiveCampaign.availableDateTo,
    };
  }

  return {
    min: options.availableDateFrom,
    max: options.availableDateTo,
  };
};

export const keepDateWithinBounds = (
  value: string | null,
  bounds: FiltroCarteraDateBounds
): string | null => {
  if (!value) {
    return null;
  }

  if (bounds.min && value < bounds.min) {
    return null;
  }

  if (bounds.max && value > bounds.max) {
    return null;
  }

  return value;
};


export const getPortfolioSupervisorOptionsForContext = (
  options: CentroControlCarteraFilterOptions,
  campaignId: string | null,
  subPortfolioId: string | null,
  includeUnassigned = false,
  index: FiltroCarteraIndex = buildFiltroCarteraIndex(options)
): readonly PortfolioSupervisorFilterOption[] => {
  if (!campaignId) {
    return [];
  }

  const availableSupervisorIds = getIndexedSupervisorIds(
    index,
    campaignId,
    subPortfolioId
  );

  const contextualOptions = options.supervisors.filter((item) =>
    availableSupervisorIds.has(item.id)
  );

  if (!includeUnassigned) {
    return contextualOptions;
  }

  return [
    ...contextualOptions,
    {
      id: PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
      label: 'Sin supervisor',
    },
  ];
};
