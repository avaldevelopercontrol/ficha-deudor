import type {
  CentroControlCarteraFilters,
} from '../domain/filtrosCartera.types';

export const DEFAULT_CENTRO_CONTROL_CARTERA_FILTERS: CentroControlCarteraFilters = {
  businessUnit: null,
  dateFrom: null,
  dateTo: null,
  subPortfolioId: null,
  campaignId: null,
  supervisorId: null,
};

export const CENTRO_CONTROL_CARTERA_ERROR_MESSAGE =
  'No se pudo cargar la información del Portfolio Control Center.';
