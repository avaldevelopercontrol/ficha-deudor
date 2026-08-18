import type {
  PortfolioControlCenterFilters,
} from '../../../types/portfolioControlCenter.types';

export const DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS: PortfolioControlCenterFilters = {
  dateFrom: null,
  dateTo: null,
  subPortfolioId: null,
  campaignId: null,
  supervisorId: null,
};

export const PORTFOLIO_CONTROL_CENTER_ERROR_MESSAGE =
  'No se pudo cargar la información del Portfolio Control Center.';
