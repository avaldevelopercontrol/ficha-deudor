const BASE_GESTION = '/v1/Gestion';

export const ESTADOS_GESTION_ENDPOINTS = {
  RESUMIDOS: `${BASE_GESTION}/GetGestionEstadosGestionesCarteraDeudor`,
  HISTORICOS: `${BASE_GESTION}/GetGestionEstadosGestionesCarteraDeudorHistorica`,
} as const;

export const ESTADOS_GESTION_INITIAL_PAGE_SIZE = 10;
export const ESTADOS_GESTION_HISTORICOS_INITIAL_PAGE_SIZE = 10;

export const ESTADOS_GESTION_FETCH_PAGE_NUMBER = 1;
export const ESTADOS_GESTION_FETCH_PAGE_SIZE = 1000;

export const ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_NUMBER = 1;
export const ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_SIZE = 1000;

export const ESTADOS_GESTION_ERROR_MESSAGES = {
  RESUMIDOS: 'Error cargando estados de gestión',
  HISTORICOS: 'Error cargando estados de gestión históricos',
} as const;