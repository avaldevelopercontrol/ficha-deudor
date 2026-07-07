const BASE_GESTION = '/v1/Gestion';

export const FICHA_GESTION_ENDPOINTS = {
  ESTADOS: `${BASE_GESTION}/GetGestionEstadoGestion`,
  TIPOS: `${BASE_GESTION}/GetGestionTipoGestion`,
  PALETA_RESPUESTA: `${BASE_GESTION}/GetGestionPaletaRespuesta`,
  ESTADO_GESTION_CLARO: `${BASE_GESTION}/GetGestionEstadoGestionClaro`,
  MOTIVO_NO_PAGO: `${BASE_GESTION}/GetGestionMotivoNoPago`,
  CREATE_GESTION: `${BASE_GESTION}/CreateGestionOpeGesContratos`,
} as const;

export const FICHA_GESTION_ERROR_MESSAGES = {
  ESTADOS: 'Error cargando estados de gestión',
  TIPOS: 'Error cargando tipos de gestión',
  PALETA_RESPUESTA: 'Error cargando paleta de respuesta',
  ESTADO_GESTION_CLARO: 'Error cargando Estado Gestión Claro',
  MOTIVO_NO_PAGO: 'Error cargando Motivo No Pago',
  CREATE_GESTION: 'Error guardando la gestión',
} as const;