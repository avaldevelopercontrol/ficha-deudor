const BASE_GESTION = '/v1/Gestion';
const BASE_BOTON = '/v1/Boton';
export const DOCUMENTOS_API_ENDPOINTS = {
  CABECERA: `${BASE_GESTION}/GetGestionDocumentosCabecera`,
  DOCUMENTOS: `${BASE_GESTION}/GetGestionDocumentos`,
  BOTONES: `${BASE_BOTON}/GetBotonesByClienteAndContrato`,
} as const;