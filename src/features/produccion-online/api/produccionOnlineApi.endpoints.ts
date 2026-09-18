import type {
  ProduccionOnlineFilters,
} from '../types/produccionOnline.types';

export const PRODUCCION_ONLINE_API_ENDPOINTS = {
  provincias:
    '/v1/Produccion/GetProvinciasProduccion',
  perfiles:
    '/v1/Produccion/GetPerfilesProduccion',
  clientes:
    '/v1/Produccion/GetClientesProduccionActivos',
  resumen:
    '/v1/Produccion/GetProduccionResumen',
} as const;

export const buildProduccionResumenEndpoint = (
  filters: ProduccionOnlineFilters
): string => {
  const params = new URLSearchParams({
    nId_Cliente: String(filters.idCliente),
    nId_Perfil: String(filters.idPerfil),
    nId_Ubigeo: String(filters.idUbigeo),
    nId_TipoLlamada: String(
      filters.idTipoLlamada
    ),
  });

  return `${
    PRODUCCION_ONLINE_API_ENDPOINTS.resumen
  }?${params.toString()}`;
};
