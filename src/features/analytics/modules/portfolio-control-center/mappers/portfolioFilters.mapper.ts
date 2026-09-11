import type {
  PortfolioFilterOptionsApiResponse,
} from '../api/portfolioControlCenterApi.types';
import type {
  PortfolioControlCenterFilterOptions,
} from '../domain/portfolioFilters.types';

const getCampaignCalendarPartFromCode = (
  campaignCode: string
): { year: number; month: number } | null => {
  const match = /^(\d{4})-(\d{1,2})$/.exec(campaignCode);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return { year, month };
};

const getCampaignCalendarPartFromDate = (
  date: string
): { year: number; month: number } | null => {
  const match = /^(\d{4})-(\d{2})-\d{2}/.exec(date);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return { year, month };
};

const resolveCampaignCalendarParts = (campaign: {
  code: string;
  year?: number;
  month?: number;
  startDate: string;
  endDate: string;
  availableDateFrom: string;
}): { year: number; month: number } => {
  if (
    Number.isInteger(campaign.year) &&
    Number.isInteger(campaign.month) &&
    (campaign.month ?? 0) >= 1 &&
    (campaign.month ?? 0) <= 12
  ) {
    return {
      year: campaign.year as number,
      month: campaign.month as number,
    };
  }

  const fallback =
    getCampaignCalendarPartFromCode(campaign.code) ??
    getCampaignCalendarPartFromDate(campaign.startDate) ??
    getCampaignCalendarPartFromDate(campaign.endDate) ??
    getCampaignCalendarPartFromDate(campaign.availableDateFrom);

  if (!fallback) {
    throw new Error(`Campaña sin año/mes válido: ${campaign.code}`);
  }

  return fallback;
};

export const mapPortfolioFilterOptionsResponse = (
  response: PortfolioFilterOptionsApiResponse
): PortfolioControlCenterFilterOptions => ({
  availableDateFrom: response.availableDateFrom,
  availableDateTo: response.availableDateTo,
  portfolio: {
    id: String(response.portfolio.id),
  },
  businessUnits: (response.businessUnits ?? []).map((item) => ({
    id: item.code.trim(),
    label: item.name.trim(),
  })),
  selectedBusinessUnit:
    response.selectedBusinessUnit?.trim() ?? null,
  subPortfolios: response.subPortfolios.map((item) => ({
    id: String(item.id),
    label: item.name,
  })),
  campaigns: response.campaigns.map((item) => {
    const { year, month } = resolveCampaignCalendarParts(item);

    return {
      id: item.code,
      label: item.name,
      year,
      month,
      startDate: item.startDate,
      endDate: item.endDate,
      availableDateFrom: item.availableDateFrom,
      availableDateTo: item.availableDateTo,
    };
  }),
  supervisors: response.supervisors.map((item) => ({
    id: String(item.id),
    label: item.name,
  })),
  availability: {
    subPortfolioCampaigns:
      response.availability.subPortfolioCampaigns.map((item) => ({
        subPortfolioId: String(item.subPortfolioId),
        campaignId: item.campaignCode,
        availableDateFrom: item.availableDateFrom,
        availableDateTo: item.availableDateTo,
      })),
    supervisorContexts:
      response.availability.supervisorContexts.map((item) => ({
        supervisorId: String(item.supervisorId),
        subPortfolioId: String(item.subPortfolioId),
        campaignId: item.campaignCode,
        availableDateFrom: item.availableDateFrom,
        availableDateTo: item.availableDateTo,
      })),
  },
});
