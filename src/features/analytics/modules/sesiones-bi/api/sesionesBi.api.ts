import {
  analyticsApiClient,
} from '@shared/api/analyticsApiClient';

import type {
  SesionBiDetail,
  SesionBiEstado,
  SesionBiEvent,
  SesionBiRow,
  SesionesBiCatalogs,
  SesionesBiFilterOption,
  SesionesBiPanel,
  SesionesBiPanelFilters,
  SesionesBiReportFilterOption,
  SesionesBiReportUsage,
  SesionesBiSummary,
  SesionesBiTrendPoint,
  SesionesBiUserUsage,
} from '../domain/sesionesBi.types';

const PANEL_PATH =
  '/v1/Analitica/PowerBi/Sesiones/Panel';
const SESSIONS_PATH =
  '/v1/Analitica/PowerBi/Sesiones';

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const expectRecord = (
  value: unknown,
  path: string
): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new Error(`${path} debe ser un objeto.`);
  }

  return value;
};

const expectString = (
  value: unknown,
  path: string
): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${path} debe ser texto no vacío.`);
  }

  return value;
};

const expectNullableString = (
  value: unknown,
  path: string
): string | null => {
  if (value === null) {
    return null;
  }

  return expectString(value, path);
};

const expectBoolean = (
  value: unknown,
  path: string
): boolean => {
  if (typeof value !== 'boolean') {
    throw new Error(`${path} debe ser booleano.`);
  }

  return value;
};

const expectNonNegativeInteger = (
  value: unknown,
  path: string
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error(`${path} debe ser un entero no negativo.`);
  }

  return value;
};

const expectPositiveInteger = (
  value: unknown,
  path: string
): number => {
  const parsed = expectNonNegativeInteger(value, path);

  if (parsed === 0) {
    throw new Error(`${path} debe ser un entero positivo.`);
  }

  return parsed;
};

const expectNullablePositiveInteger = (
  value: unknown,
  path: string
): number | null =>
  value === null
    ? null
    : expectPositiveInteger(value, path);

const expectIsoDateTime = (
  value: unknown,
  path: string
): string => {
  const text = expectString(value, path);
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)
    ? text
    : `${text}Z`;

  if (Number.isNaN(Date.parse(normalized))) {
    throw new Error(`${path} debe ser una fecha ISO válida.`);
  }

  return normalized;
};

const expectNullableIsoDateTime = (
  value: unknown,
  path: string
): string | null =>
  value === null
    ? null
    : expectIsoDateTime(value, path);

const SESSION_STATES = new Set<SesionBiEstado>([
  'ACTIVA',
  'PAUSADA',
  'CERRADA',
  'EXPIRADA',
]);

const expectSessionState = (
  value: unknown,
  path: string
): SesionBiEstado => {
  const state = expectString(value, path).toUpperCase();

  if (!SESSION_STATES.has(state as SesionBiEstado)) {
    throw new Error(`${path} contiene un estado no soportado.`);
  }

  return state as SesionBiEstado;
};

const expectArray = <T>(
  value: unknown,
  path: string,
  mapper: (item: unknown, itemPath: string) => T
): T[] => {
  if (!Array.isArray(value)) {
    throw new Error(`${path} debe ser una colección.`);
  }

  return value.map((item, index) =>
    mapper(item, `${path}[${index}]`)
  );
};

const mapSummary = (
  value: unknown,
  path: string
): SesionesBiSummary => {
  const row = expectRecord(value, path);

  return {
    activeSessions: expectNonNegativeInteger(
      row.sesionesActivas,
      `${path}.sesionesActivas`
    ),
    totalSessions: expectNonNegativeInteger(
      row.totalSesiones,
      `${path}.totalSesiones`
    ),
    uniqueUsers: expectNonNegativeInteger(
      row.usuariosUnicos,
      `${path}.usuariosUnicos`
    ),
    visibleSeconds: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
    averageSecondsPerSession: expectNonNegativeInteger(
      row.promedioSegundosPorSesion,
      `${path}.promedioSegundosPorSesion`
    ),
  };
};

const mapReportUsage = (
  value: unknown,
  path: string
): SesionesBiReportUsage => {
  const row = expectRecord(value, path);

  return {
    reportId: expectPositiveInteger(
      row.idOpcionReporte,
      `${path}.idOpcionReporte`
    ),
    reportName: expectString(
      row.reporteNombre,
      `${path}.reporteNombre`
    ),
    sessions: expectNonNegativeInteger(
      row.sesiones,
      `${path}.sesiones`
    ),
    uniqueUsers: expectNonNegativeInteger(
      row.usuariosUnicos,
      `${path}.usuariosUnicos`
    ),
    visibleSeconds: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
  };
};

const mapUserUsage = (
  value: unknown,
  path: string
): SesionesBiUserUsage => {
  const row = expectRecord(value, path);

  return {
    userId: expectPositiveInteger(
      row.idUsuario,
      `${path}.idUsuario`
    ),
    userLogin: expectString(
      row.usuarioLogin,
      `${path}.usuarioLogin`
    ),
    userName: expectString(
      row.usuarioNombre,
      `${path}.usuarioNombre`
    ),
    sessions: expectNonNegativeInteger(
      row.sesiones,
      `${path}.sesiones`
    ),
    uniqueReports: expectNonNegativeInteger(
      row.reportesUnicos,
      `${path}.reportesUnicos`
    ),
    visibleSeconds: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
  };
};

const mapTrend = (
  value: unknown,
  path: string
): SesionesBiTrendPoint => {
  const row = expectRecord(value, path);

  return {
    periodUtc: expectIsoDateTime(
      row.periodoUtc,
      `${path}.periodoUtc`
    ),
    sessions: expectNonNegativeInteger(
      row.sesiones,
      `${path}.sesiones`
    ),
    uniqueUsers: expectNonNegativeInteger(
      row.usuariosUnicos,
      `${path}.usuariosUnicos`
    ),
    visibleSeconds: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
  };
};

const mapFilterOption = (
  value: unknown,
  path: string
): SesionesBiFilterOption => {
  const row = expectRecord(value, path);

  return {
    id: expectPositiveInteger(row.id, `${path}.id`),
    name: expectString(row.nombre, `${path}.nombre`),
  };
};


const mapReportFilterOption = (
  value: unknown,
  path: string
): SesionesBiReportFilterOption => {
  const row = expectRecord(value, path);

  return {
    id: expectPositiveInteger(row.id, `${path}.id`),
    name: expectString(row.nombre, `${path}.nombre`),
    requiresClientSelection: expectBoolean(
      row.requiereSeleccionCliente,
      `${path}.requiereSeleccionCliente`
    ),
  };
};

const mapCatalogs = (
  value: unknown,
  path: string
): SesionesBiCatalogs => {
  const row = expectRecord(value, path);

  return {
    reports: expectArray(
      row.reportes,
      `${path}.reportes`,
      mapReportFilterOption
    ),
    users: expectArray(
      row.usuarios,
      `${path}.usuarios`,
      mapFilterOption
    ),
    clients: expectArray(
      row.clientes,
      `${path}.clientes`,
      mapFilterOption
    ),
    statuses: expectArray(
      row.estados,
      `${path}.estados`,
      expectSessionState
    ),
  };
};

const mapSession = (
  value: unknown,
  path: string
): SesionBiRow => {
  const row = expectRecord(value, path);

  return {
    sessionId: expectString(row.idSesion, `${path}.idSesion`),
    userId: expectPositiveInteger(row.idUsuario, `${path}.idUsuario`),
    userLogin: expectString(row.usuarioLogin, `${path}.usuarioLogin`),
    userName: expectString(row.usuarioNombre, `${path}.usuarioNombre`),
    reportId: expectPositiveInteger(
      row.idOpcionReporte,
      `${path}.idOpcionReporte`
    ),
    reportName: expectString(row.reporteNombre, `${path}.reporteNombre`),
    clientId: expectNullablePositiveInteger(
      row.idCliente,
      `${path}.idCliente`
    ),
    clientName: expectNullableString(
      row.clienteNombre,
      `${path}.clienteNombre`
    ),
    startedAtUtc: expectIsoDateTime(
      row.fechaInicioUtc,
      `${path}.fechaInicioUtc`
    ),
    lastHeartbeatAtUtc: expectIsoDateTime(
      row.fechaUltimoHeartbeatUtc,
      `${path}.fechaUltimoHeartbeatUtc`
    ),
    endedAtUtc: expectNullableIsoDateTime(
      row.fechaFinUtc,
      `${path}.fechaFinUtc`
    ),
    visibleSeconds: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
    isVisible: expectBoolean(row.estaVisible, `${path}.estaVisible`),
    status: expectSessionState(row.estado, `${path}.estado`),
    closeReason: expectNullableString(
      row.motivoCierre,
      `${path}.motivoCierre`
    ),
  };
};

const mapPanel = (value: unknown): SesionesBiPanel => {
  const row = expectRecord(value, '$');
  const sessions = expectRecord(row.sesiones, '$.sesiones');

  return {
    fromUtc: expectIsoDateTime(row.desdeUtc, '$.desdeUtc'),
    toUtc: expectIsoDateTime(row.hastaUtc, '$.hastaUtc'),
    trendGranularity: expectString(
      row.granularidadTendencia,
      '$.granularidadTendencia'
    ),
    summary: mapSummary(row.resumen, '$.resumen'),
    reportUsage: expectArray(
      row.usoReportes,
      '$.usoReportes',
      mapReportUsage
    ),
    topUsers: expectArray(
      row.usuariosMayorUso,
      '$.usuariosMayorUso',
      mapUserUsage
    ),
    trend: expectArray(row.tendencia, '$.tendencia', mapTrend),
    catalogs: mapCatalogs(row.catalogos, '$.catalogos'),
    sessions: {
      page: expectPositiveInteger(sessions.pagina, '$.sesiones.pagina'),
      pageSize: expectPositiveInteger(
        sessions.tamanoPagina,
        '$.sesiones.tamanoPagina'
      ),
      total: expectNonNegativeInteger(sessions.total, '$.sesiones.total'),
      items: expectArray(
        sessions.items,
        '$.sesiones.items',
        mapSession
      ),
    },
  };
};

const mapEvent = (
  value: unknown,
  path: string
): SesionBiEvent => {
  const row = expectRecord(value, path);

  return {
    eventId: expectPositiveInteger(row.idEvento, `${path}.idEvento`),
    eventType: expectString(row.tipoEvento, `${path}.tipoEvento`),
    eventAtUtc: expectIsoDateTime(row.fechaEventoUtc, `${path}.fechaEventoUtc`),
    visibleSeconds: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
    origin: expectString(row.origen, `${path}.origen`),
    detail: expectNullableString(row.detalle, `${path}.detalle`),
  };
};

const mapDetail = (value: unknown): SesionBiDetail => {
  const row = expectRecord(value, '$');

  return {
    session: mapSession(row.sesion, '$.sesion'),
    elapsedSeconds: expectNonNegativeInteger(
      row.segundosTranscurridos,
      '$.segundosTranscurridos'
    ),
    estimatedHiddenSeconds: expectNonNegativeInteger(
      row.segundosNoVisiblesEstimados,
      '$.segundosNoVisiblesEstimados'
    ),
    events: expectArray(row.eventos, '$.eventos', mapEvent),
  };
};

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
  appendQuery(params, 'busqueda', filters.search.trim());
  appendQuery(params, 'orden', filters.order);
  appendQuery(params, 'pagina', filters.page);
  appendQuery(params, 'tamanoPagina', filters.pageSize);

  return `${PANEL_PATH}?${params.toString()}`;
};

export const getSesionesBiPanel = async (
  filters: SesionesBiPanelFilters,
  signal?: AbortSignal
): Promise<SesionesBiPanel> => {
  const response = await analyticsApiClient.get<unknown>(
    buildSesionesBiPanelPath(filters),
    {
      includeSelectedCrmClientId: false,
      signal,
    }
  );

  return mapPanel(response);
};

export const getSesionBiDetail = async (
  sessionId: string,
  signal?: AbortSignal
): Promise<SesionBiDetail> => {
  const response = await analyticsApiClient.get<unknown>(
    `${SESSIONS_PATH}/${encodeURIComponent(sessionId)}`,
    {
      includeSelectedCrmClientId: false,
      signal,
    }
  );

  return mapDetail(response);
};
