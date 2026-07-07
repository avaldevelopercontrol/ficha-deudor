const BASE_GESTION = '/v1/Gestion';

export const GESTIONES_REALIZADAS_ENDPOINTS = {
  RESUMIDAS: `${BASE_GESTION}/GetGestionGestionesCarteraDeudor`,
  HISTORICAS: `${BASE_GESTION}/GetGestionEstadosGestionesCarteraDeudorHistorica`,
} as const;

export const GESTIONES_REALIZADAS_INITIAL_PAGE_SIZE = 10;
export const GESTIONES_HISTORICAS_INITIAL_PAGE_SIZE = 10;

export const GESTIONES_REALIZADAS_FETCH_PAGE_NUMBER = 1;
export const GESTIONES_REALIZADAS_FETCH_PAGE_SIZE = 1000;
export const GESTIONES_HISTORICAS_DEFAULT_PAGE_NUMBER = 1;
export const GESTIONES_HISTORICAS_DEFAULT_PAGE_SIZE = 1000;

export const GESTIONES_REALIZADAS_ERROR_MESSAGES = {
  RESUMIDAS: 'Error cargando gestiones',
  HISTORICAS: 'Error cargando gestiones históricas',
} as const;