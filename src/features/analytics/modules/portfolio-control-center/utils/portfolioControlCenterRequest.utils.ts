import type {
  PortfolioControlCenterFilters,
} from '../../../types/portfolioControlCenter.types';

export type PortfolioControlCenterLoadMode =
  | 'bootstrap'
  | 'overview';

interface ResolvePortfolioControlCenterLoadModeParams {
  filterOptionsLoaded: boolean;
  forceBootstrap: boolean;
  selectedBusinessUnit: string | null;
  requestedBusinessUnit: string | null;
  currentCampaignUnavailable?: boolean;
  requestedCampaignId?: string | null;
}

const normalizeBusinessUnit = (
  businessUnit: string | null
): string | null => businessUnit?.trim() || null;

const isSameBusinessUnit = (
  left: string,
  right: string
): boolean =>
  left.localeCompare(right, undefined, {
    sensitivity: 'accent',
  }) === 0;

export const resolvePortfolioControlCenterLoadMode = ({
  filterOptionsLoaded,
  forceBootstrap,
  selectedBusinessUnit,
  requestedBusinessUnit,
  currentCampaignUnavailable = false,
  requestedCampaignId = null,
}: ResolvePortfolioControlCenterLoadModeParams): PortfolioControlCenterLoadMode => {
  if (!filterOptionsLoaded || forceBootstrap) {
    return 'bootstrap';
  }

  const requested = normalizeBusinessUnit(
    requestedBusinessUnit
  );
  const selected = normalizeBusinessUnit(
    selectedBusinessUnit
  );

  if (
    requested !== null &&
    (selected === null ||
      !isSameBusinessUnit(requested, selected))
  ) {
    return 'bootstrap';
  }

  if (
    currentCampaignUnavailable &&
    !requestedCampaignId?.trim()
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
