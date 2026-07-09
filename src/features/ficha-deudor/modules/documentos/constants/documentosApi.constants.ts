const BASE_GESTION = '/v1/Gestion';
const BASE_DOCUMENTOS = '/v1/documentos';

export const DOCUMENTOS_API_ENDPOINTS = {
  CABECERA: `${BASE_GESTION}/GetGestionDocumentosCabecera`,
  DOCUMENTOS: `${BASE_GESTION}/GetGestionDocumentos`,
  BOTONES: `${BASE_DOCUMENTOS}/botones`,
} as const;