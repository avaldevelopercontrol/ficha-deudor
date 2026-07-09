const BASE_DIRECCION = '/v1/Direccion';

export const DIRECCIONES_REFERENCIADAS_ENDPOINTS = {
  LIST: `${BASE_DIRECCION}/GetDirecciones`,
  CREATE: BASE_DIRECCION,
  UPDATE: BASE_DIRECCION,
  BY_ID: BASE_DIRECCION,
  DEPARTAMENTOS: `${BASE_DIRECCION}/GetDireccionDepartamentos`,
  PROVINCIAS: `${BASE_DIRECCION}/GetDireccionProvincias`,
  DISTRITOS: `${BASE_DIRECCION}/GetDireccionDistritos`,
  UBICACIONES: `${BASE_DIRECCION}/GetDireccionUbicaciones`,
} as const;

export const DIRECCIONES_REFERENCIADAS_INITIAL_PAGE_SIZE = 10;

export const DIRECCIONES_REFERENCIADAS_FETCH_PAGE_NUMBER = 1;
export const DIRECCIONES_REFERENCIADAS_FETCH_PAGE_SIZE = 1000;

export const DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES = {
  LIST: 'Error cargando direcciones',
  CREATE: 'Error al crear dirección',
  UPDATE: 'Error al actualizar dirección',
  BY_ID: 'Error cargando dirección',
  BY_ID_EDIT: 'Error cargando dirección para editar',
  DEPARTAMENTOS: 'Error cargando departamentos',
  PROVINCIAS: 'Error cargando provincias',
  DISTRITOS: 'Error cargando distritos',
  UBICACIONES: 'Error cargando ubicaciones',
} as const;