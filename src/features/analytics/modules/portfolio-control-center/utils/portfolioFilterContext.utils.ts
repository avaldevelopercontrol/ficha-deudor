import type {
  PortfolioCampaignFilterOption,
  PortfolioControlCenterFilterOptions,
  PortfolioFilterOption,
  PortfolioSupervisorFilterOption,
} from '../../../types/portfolioControlCenter.types';


export const PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID =
  '__unassigned__';

export interface PortfolioFilterDateBounds {
  min: string | null;
  max: string | null;
}

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

const isCampaignAvailableForPortfolio = (
  options: PortfolioControlCenterFilterOptions,
  campaignId: string,
  subPortfolioId: string | null
): boolean => {
  if (!subPortfolioId) {
    return true;
  }

  return options.availability.subPortfolioCampaigns.some(
    (item) =>
      item.subPortfolioId === subPortfolioId &&
      item.campaignId === campaignId
  );
};

export const getLatestPortfolioCampaign = (
  options: PortfolioControlCenterFilterOptions,
  subPortfolioId: string | null = null,
  campaignYear: number | null = null
): PortfolioCampaignFilterOption | null => {
  return options.campaigns.reduce<
    PortfolioCampaignFilterOption | null
  >((latest, campaign) => {
    if (
      (campaignYear !== null &&
        campaign.year !== campaignYear) ||
      !isCampaignAvailableForPortfolio(
        options,
        campaign.id,
        subPortfolioId
      )
    ) {
      return latest;
    }

    if (!latest) {
      return campaign;
    }

    return compareCampaignRecency(campaign, latest) > 0
      ? campaign
      : latest;
  }, null);
};


const getPortfolioCampaignsForContext = (
  options: PortfolioControlCenterFilterOptions,
  subPortfolioId: string | null
): readonly PortfolioCampaignFilterOption[] => {
  return options.campaigns.filter((campaign) =>
    isCampaignAvailableForPortfolio(
      options,
      campaign.id,
      subPortfolioId
    )
  );
};

export const getPortfolioCampaignYearOptions = (
  options: PortfolioControlCenterFilterOptions,
  subPortfolioId: string | null = null
): PortfolioFilterOption[] => {
  const years = new Set(
    getPortfolioCampaignsForContext(
      options,
      subPortfolioId
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
  options: PortfolioControlCenterFilterOptions,
  campaignYear: number | null,
  subPortfolioId: string | null = null
): PortfolioFilterOption[] => {
  if (campaignYear === null) {
    return [];
  }

  const campaigns = getPortfolioCampaignsForContext(
    options,
    subPortfolioId
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

const getSubPortfolioCampaignAvailability = (
  options: PortfolioControlCenterFilterOptions,
  subPortfolioId: string | null,
  campaignId: string | null
) => {
  if (!subPortfolioId || !campaignId) {
    return null;
  }

  return (
    options.availability.subPortfolioCampaigns.find(
      (item) =>
        item.subPortfolioId === subPortfolioId &&
        item.campaignId === campaignId
    ) ?? null
  );
};

export const getPortfolioFilterDateBounds = (
  options: PortfolioControlCenterFilterOptions,
  campaignId: string | null,
  useLatestCampaignFallback: boolean,
  subPortfolioId: string | null = null
): PortfolioFilterDateBounds => {
  const selectedCampaign = campaignId
    ? options.campaigns.find(
        (campaign) =>
          campaign.id === campaignId &&
          isCampaignAvailableForPortfolio(
            options,
            campaign.id,
            subPortfolioId
          )
      ) ?? null
    : null;

  const effectiveCampaign =
    selectedCampaign ??
    (useLatestCampaignFallback
      ? getLatestPortfolioCampaign(
          options,
          subPortfolioId
        )
      : null);

  if (effectiveCampaign) {
    const portfolioAvailability =
      getSubPortfolioCampaignAvailability(
        options,
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
  bounds: PortfolioFilterDateBounds
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
  options: PortfolioControlCenterFilterOptions,
  campaignId: string | null,
  subPortfolioId: string | null,
  includeUnassigned = false
): readonly PortfolioSupervisorFilterOption[] => {
  if (!campaignId) {
    return [];
  }

  const availableSupervisorIds = new Set(
    options.availability.supervisorContexts
      .filter((item) => {
        if (item.campaignId !== campaignId) {
          return false;
        }

        if (
          subPortfolioId &&
          item.subPortfolioId !== subPortfolioId
        ) {
          return false;
        }

        return true;
      })
      .map((item) => item.supervisorId)
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
