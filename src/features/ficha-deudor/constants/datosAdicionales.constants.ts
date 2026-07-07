const BASE_GESTION = '/v1/Gestion';

export const DATOS_ADICIONALES_ENDPOINTS = {
  CABECERA: `${BASE_GESTION}/GetGestionDocumentosAdicionalesCabecera`,
  DATA: `${BASE_GESTION}/GetGestionDocumentosAdicionales`,
} as const;

export const DATOS_ADICIONALES_INITIAL_PAGE_SIZE = 10;

export const DATOS_ADICIONALES_FETCH_PAGE_NUMBER = 1;
export const DATOS_ADICIONALES_FETCH_PAGE_SIZE = 1000;

export const DATOS_ADICIONALES_ERROR_MESSAGES = {
  META: 'Error cargando cabeceras',
  DATA: 'Error cargando datos adicionales',
} as const;