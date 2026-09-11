import type {
  PortfolioCampaignFilterOption,
  PortfolioControlCenterFilterOptions,
  SubPortfolioCampaignAvailability,
} from './portfolioFilters.types';

const EMPTY_IDS: ReadonlySet<string> = new Set<string>();

const buildContextKey = (
  campaignId: string,
  subPortfolioId: string | null
): string => `${campaignId}\u0000${subPortfolioId ?? ''}`;

const buildSubPortfolioCampaignKey = (
  subPortfolioId: string,
  campaignId: string
): string => `${subPortfolioId}\u0000${campaignId}`;

const addToSetIndex = (
  index: Map<string, Set<string>>,
  key: string,
  value: string
): void => {
  const values = index.get(key);

  if (values) {
    values.add(value);
    return;
  }

  index.set(key, new Set([value]));
};

export interface PortfolioFilterIndex {
  campaignsById: ReadonlyMap<string, PortfolioCampaignFilterOption>;
  campaignIdsBySubPortfolio: ReadonlyMap<string, ReadonlySet<string>>;
  campaignsBySubPortfolio: ReadonlyMap<
    string,
    readonly PortfolioCampaignFilterOption[]
  >;
  subPortfolioCampaignAvailabilityByKey: ReadonlyMap<
    string,
    SubPortfolioCampaignAvailability
  >;
  supervisorIdsByCampaign: ReadonlyMap<string, ReadonlySet<string>>;
  supervisorIdsBySubPortfolio: ReadonlyMap<string, ReadonlySet<string>>;
  supervisorIdsByContext: ReadonlyMap<string, ReadonlySet<string>>;
}

export const buildPortfolioFilterIndex = (
  options: PortfolioControlCenterFilterOptions
): PortfolioFilterIndex => {
  const campaignsById = new Map(
    options.campaigns.map((campaign) => [campaign.id, campaign] as const)
  );
  const campaignIdsBySubPortfolio = new Map<string, Set<string>>();
  const campaignsBySubPortfolio = new Map<
    string,
    PortfolioCampaignFilterOption[]
  >();
  const subPortfolioCampaignAvailabilityByKey = new Map<
    string,
    SubPortfolioCampaignAvailability
  >();

  options.availability.subPortfolioCampaigns.forEach((availability) => {
    const campaignIds = campaignIdsBySubPortfolio.get(
      availability.subPortfolioId
    );
    const isNewRelation = !campaignIds?.has(availability.campaignId);

    addToSetIndex(
      campaignIdsBySubPortfolio,
      availability.subPortfolioId,
      availability.campaignId
    );

    if (isNewRelation) {
      const campaign = campaignsById.get(availability.campaignId);

      if (campaign) {
        const campaigns =
          campaignsBySubPortfolio.get(availability.subPortfolioId);

        if (campaigns) {
          campaigns.push(campaign);
        } else {
          campaignsBySubPortfolio.set(
            availability.subPortfolioId,
            [campaign]
          );
        }
      }
    }

    subPortfolioCampaignAvailabilityByKey.set(
      buildSubPortfolioCampaignKey(
        availability.subPortfolioId,
        availability.campaignId
      ),
      availability
    );
  });

  const supervisorIdsByCampaign = new Map<string, Set<string>>();
  const supervisorIdsBySubPortfolio = new Map<string, Set<string>>();
  const supervisorIdsByContext = new Map<string, Set<string>>();

  options.availability.supervisorContexts.forEach((availability) => {
    addToSetIndex(
      supervisorIdsByCampaign,
      availability.campaignId,
      availability.supervisorId
    );
    addToSetIndex(
      supervisorIdsBySubPortfolio,
      availability.subPortfolioId,
      availability.supervisorId
    );
    addToSetIndex(
      supervisorIdsByContext,
      buildContextKey(availability.campaignId, availability.subPortfolioId),
      availability.supervisorId
    );
  });

  return {
    campaignsById,
    campaignIdsBySubPortfolio,
    campaignsBySubPortfolio,
    subPortfolioCampaignAvailabilityByKey,
    supervisorIdsByCampaign,
    supervisorIdsBySubPortfolio,
    supervisorIdsByContext,
  };
};

export const isPortfolioCampaignAvailable = (
  index: PortfolioFilterIndex,
  campaignId: string,
  subPortfolioId: string | null
): boolean => {
  if (!subPortfolioId) {
    return true;
  }

  return (
    index.campaignIdsBySubPortfolio
      .get(subPortfolioId)
      ?.has(campaignId) === true
  );
};

export const getIndexedSubPortfolioCampaignAvailability = (
  index: PortfolioFilterIndex,
  subPortfolioId: string | null,
  campaignId: string | null
): SubPortfolioCampaignAvailability | null => {
  if (!subPortfolioId || !campaignId) {
    return null;
  }

  return (
    index.subPortfolioCampaignAvailabilityByKey.get(
      buildSubPortfolioCampaignKey(subPortfolioId, campaignId)
    ) ?? null
  );
};

export const getIndexedSupervisorIds = (
  index: PortfolioFilterIndex,
  campaignId: string,
  subPortfolioId: string | null
): ReadonlySet<string> => {
  if (!subPortfolioId) {
    return index.supervisorIdsByCampaign.get(campaignId) ?? EMPTY_IDS;
  }

  return (
    index.supervisorIdsByContext.get(
      buildContextKey(campaignId, subPortfolioId)
    ) ?? EMPTY_IDS
  );
};

export const hasIndexedSupervisorContext = (
  index: PortfolioFilterIndex,
  supervisorId: string,
  campaignId: string | null,
  subPortfolioId: string | null
): boolean => {
  if (!campaignId && !subPortfolioId) {
    return true;
  }

  if (!campaignId && subPortfolioId) {
    return (
      index.supervisorIdsBySubPortfolio
        .get(subPortfolioId)
        ?.has(supervisorId) === true
    );
  }

  if (!campaignId) {
    return false;
  }

  return getIndexedSupervisorIds(
    index,
    campaignId,
    subPortfolioId
  ).has(supervisorId);
};
