const BASE_TELEFONO = '/v1/Telefono';

export const TELEFONOS_REFERENCIADOS_ENDPOINTS = {
  LIST: `${BASE_TELEFONO}/GetTelefonos`,
  BY_ID: BASE_TELEFONO,
  CREATE: BASE_TELEFONO,
  UPDATE: BASE_TELEFONO,
  RESULTADOS: `${BASE_TELEFONO}/GetTelefonoResultados`,
  OPERADORES: `${BASE_TELEFONO}/GetTelefonoOperadores`,
  UBICACIONES: `${BASE_TELEFONO}/GetTelefonoUbicaciones`,
  HORARIO_GESTION: `${BASE_TELEFONO}/GetTelefonoHorarioGestion`,
  FUENTE_BUSQUEDA: `${BASE_TELEFONO}/GetTelefonoFuenteBusqueda`,
} as const;

export const TELEFONOS_REFERENCIADOS_INITIAL_PAGE_SIZE = 10;

export const TELEFONOS_REFERENCIADOS_FETCH_PAGE_NUMBER = 1;
export const TELEFONOS_REFERENCIADOS_FETCH_PAGE_SIZE = 1000;

export const TELEFONOS_REFERENCIADOS_ERROR_MESSAGES = {
  LIST: 'Error cargando teléfonos',
  CREATE: 'Error al crear teléfono',
  UPDATE: 'Error al actualizar teléfono',
  BY_ID: 'Error cargando teléfono',
  BY_ID_EDIT: 'Error cargando teléfono para editar',
  RESULTADOS: 'Error cargando resultados telefónicos',
  OPERADORES: 'Error cargando operadores telefónicos',
  UBICACIONES: 'Error cargando ubicaciones telefónicas',
  HORARIO_GESTION: 'Error cargando horarios de gestión',
  FUENTE_BUSQUEDA: 'Error cargando fuentes de búsqueda',
} as const;