import type {
  SesionesBiPanelFilters,
} from '../domain/sesionesBi.types';

const PANEL_PATH =
  '/v1/Analitica/PowerBi/Sesiones/Panel';
const SESSIONS_PATH =
  '/v1/Analitica/PowerBi/Sesiones';

const appendQuery = (
  params: URLSearchParams,
  key: string,
  value: string | number | null
) => {
  if (value === null || value === '') {
    return;
  }

  params.set(key, String(value));
};

export const buildSesionesBiPanelPath = (
  filters: SesionesBiPanelFilters
): string => {
  const params = new URLSearchParams();

  appendQuery(params, 'desdeUtc', filters.fromUtc);
  appendQuery(params, 'hastaUtc', filters.toUtc);
  appendQuery(params, 'idOpcionReporte', filters.reportId);
  appendQuery(params, 'idUsuario', filters.userId);
  appendQuery(params, 'idCliente', filters.clientId);
  appendQuery(params, 'estado', filters.status);
  appendQuery(params, 'orden', filters.order);
  appendQuery(params, 'pagina', filters.page);
  appendQuery(params, 'tamanoPagina', filters.pageSize);

  return `${PANEL_PATH}?${params.toString()}`;
};

export const buildSesionBiDetailPath = (
  sessionId: string
): string => `${SESSIONS_PATH}/${encodeURIComponent(sessionId)}`;
