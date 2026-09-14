import type {
  UnidadNegocioCarteraCode,
} from './panoramaCartera.types';

export interface CentroControlCarteraFilters {
  businessUnit: UnidadNegocioCarteraCode | null;
  dateFrom: string | null;
  dateTo: string | null;
  subPortfolioId: string | null;
  campaignId: string | null;
  supervisorId: string | null;
}

export interface FiltroCarteraOption {
  id: string;
  label: string;
}

export type UnidadNegocioCarteraFilterOption =
  FiltroCarteraOption;

export interface PortfolioCampaignFilterOption
  extends FiltroCarteraOption {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  availableDateFrom: string;
  availableDateTo: string;
}

export type PortfolioSupervisorFilterOption =
  FiltroCarteraOption;

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

export interface FiltroCarteraScope {
  id: string;
}

export interface CentroControlCarteraFilterOptions {
  availableDateFrom: string | null;
  availableDateTo: string | null;
  portfolio: FiltroCarteraScope | null;
  businessUnits: readonly UnidadNegocioCarteraFilterOption[];
  selectedBusinessUnit: UnidadNegocioCarteraCode | null;
  subPortfolios: readonly FiltroCarteraOption[];
  campaigns: readonly PortfolioCampaignFilterOption[];
  supervisors: readonly PortfolioSupervisorFilterOption[];
  availability: {
    subPortfolioCampaigns: readonly SubPortfolioCampaignAvailability[];
    supervisorContexts: readonly PortfolioSupervisorContextAvailability[];
  };
}
