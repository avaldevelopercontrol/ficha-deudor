import type {
  PortfolioBusinessUnitCode,
} from './portfolioOverview.types';

export interface PortfolioControlCenterFilters {
  businessUnit: PortfolioBusinessUnitCode | null;
  dateFrom: string | null;
  dateTo: string | null;
  subPortfolioId: string | null;
  campaignId: string | null;
  supervisorId: string | null;
}

export interface PortfolioFilterOption {
  id: string;
  label: string;
}

export type PortfolioBusinessUnitFilterOption =
  PortfolioFilterOption;

export interface PortfolioCampaignFilterOption
  extends PortfolioFilterOption {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  availableDateFrom: string;
  availableDateTo: string;
}

export type PortfolioSupervisorFilterOption =
  PortfolioFilterOption;

export interface SubPortfolioCampaignAvailability {
  subPortfolioId: string;
  campaignId: string;
  availableDateFrom: string;
  availableDateTo: string;
}

export interface PortfolioSupervisorContextAvailability {
  supervisorId: string;
  subPortfolioId: string;
  campaignId: string;
  availableDateFrom: string;
  availableDateTo: string;
}

export interface PortfolioFilterScope {
  id: string;
}

export interface PortfolioControlCenterFilterOptions {
  availableDateFrom: string | null;
  availableDateTo: string | null;
  portfolio: PortfolioFilterScope | null;
  businessUnits: readonly PortfolioBusinessUnitFilterOption[];
  selectedBusinessUnit: PortfolioBusinessUnitCode | null;
  subPortfolios: readonly PortfolioFilterOption[];
  campaigns: readonly PortfolioCampaignFilterOption[];
  supervisors: readonly PortfolioSupervisorFilterOption[];
  availability: {
    subPortfolioCampaigns: readonly SubPortfolioCampaignAvailability[];
    supervisorContexts: readonly PortfolioSupervisorContextAvailability[];
  };
}
