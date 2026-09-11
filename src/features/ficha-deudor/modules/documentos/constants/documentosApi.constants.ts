const BASE_GESTION = '/v1/Gestion';
export const DOCUMENTOS_API_ENDPOINTS = {
  CABECERA: `${BASE_GESTION}/GetGestionDocumentosCabecera`,
  DOCUMENTOS: `${BASE_GESTION}/GetGestionDocumentos`,
  BOTONES: `${BASE_GESTION}/GetGestionBotones`,
} as const;