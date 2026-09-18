import {
  expectRuntimeArray,
  expectRuntimeBoolean,
  expectRuntimeNonEmptyString,
  expectRuntimeNonNegativeInteger,
  expectRuntimeRecord,
} from '../../../shared/api/runtimeValidation';
import type {
  SesionBiEstado,
} from '../domain/sesionesBi.types';
import type {
  SesionBiDetailApiResponse,
  SesionBiEventApiResponse,
  SesionBiRowApiResponse,
  SesionesBiCatalogsApiResponse,
  SesionesBiFilterOptionApiResponse,
  SesionesBiPanelApiResponse,
  SesionesBiReportFilterOptionApiResponse,
  SesionesBiReportUsageApiResponse,
  SesionesBiSummaryApiResponse,
  SesionesBiTrendPointApiResponse,
  SesionesBiUserUsageApiResponse,
} from './sesionesBiApi.types';

const failValidation = (
  path: string,
  expected: string
): never => {
  throw new Error(`${path} debe ser ${expected}.`);
};

const expectRecord = (
  value: unknown,
  path: string
): Record<string, unknown> =>
  expectRuntimeRecord(value, path, failValidation);

const expectString = (
  value: unknown,
  path: string
): string =>
  expectRuntimeNonEmptyString(
    value,
    path,
    failValidation,
    'texto no vacío'
  );

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
): boolean =>
  expectRuntimeBoolean(
    value,
    path,
    failValidation,
    'booleano'
  );

const expectNonNegativeInteger = (
  value: unknown,
  path: string
): number =>
  expectRuntimeNonNegativeInteger(
    value,
    path,
    failValidation
  );

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
): T[] =>
  expectRuntimeArray(
    value,
    path,
    failValidation,
    'una colección'
  ).map((item, index) =>
    mapper(item, `${path}[${index}]`)
  );

const parseSummary = (
  value: unknown,
  path: string
): SesionesBiSummaryApiResponse => {
  const row = expectRecord(value, path);

  return {
    sesionesActivas: expectNonNegativeInteger(
      row.sesionesActivas,
      `${path}.sesionesActivas`
    ),
    totalSesiones: expectNonNegativeInteger(
      row.totalSesiones,
      `${path}.totalSesiones`
    ),
    usuariosUnicos: expectNonNegativeInteger(
      row.usuariosUnicos,
      `${path}.usuariosUnicos`
    ),
    segundosVisibles: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
    promedioSegundosPorSesion: expectNonNegativeInteger(
      row.promedioSegundosPorSesion,
      `${path}.promedioSegundosPorSesion`
    ),
  };
};

const parseReportUsage = (
  value: unknown,
  path: string
): SesionesBiReportUsageApiResponse => {
  const row = expectRecord(value, path);

  return {
    idOpcionReporte: expectPositiveInteger(
      row.idOpcionReporte,
      `${path}.idOpcionReporte`
    ),
    reporteNombre: expectString(
      row.reporteNombre,
      `${path}.reporteNombre`
    ),
    sesiones: expectNonNegativeInteger(
      row.sesiones,
      `${path}.sesiones`
    ),
    usuariosUnicos: expectNonNegativeInteger(
      row.usuariosUnicos,
      `${path}.usuariosUnicos`
    ),
    segundosVisibles: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
  };
};

const parseUserUsage = (
  value: unknown,
  path: string
): SesionesBiUserUsageApiResponse => {
  const row = expectRecord(value, path);

  return {
    idUsuario: expectPositiveInteger(
      row.idUsuario,
      `${path}.idUsuario`
    ),
    usuarioLogin: expectString(
      row.usuarioLogin,
      `${path}.usuarioLogin`
    ),
    usuarioNombre: expectString(
      row.usuarioNombre,
      `${path}.usuarioNombre`
    ),
    sesiones: expectNonNegativeInteger(
      row.sesiones,
      `${path}.sesiones`
    ),
    reportesUnicos: expectNonNegativeInteger(
      row.reportesUnicos,
      `${path}.reportesUnicos`
    ),
    segundosVisibles: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
  };
};

const parseTrend = (
  value: unknown,
  path: string
): SesionesBiTrendPointApiResponse => {
  const row = expectRecord(value, path);

  return {
    periodoUtc: expectIsoDateTime(
      row.periodoUtc,
      `${path}.periodoUtc`
    ),
    sesiones: expectNonNegativeInteger(
      row.sesiones,
      `${path}.sesiones`
    ),
    usuariosUnicos: expectNonNegativeInteger(
      row.usuariosUnicos,
      `${path}.usuariosUnicos`
    ),
    segundosVisibles: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
  };
};

const parseFilterOption = (
  value: unknown,
  path: string
): SesionesBiFilterOptionApiResponse => {
  const row = expectRecord(value, path);

  return {
    id: expectPositiveInteger(row.id, `${path}.id`),
    nombre: expectString(row.nombre, `${path}.nombre`),
  };
};

const parseReportFilterOption = (
  value: unknown,
  path: string
): SesionesBiReportFilterOptionApiResponse => {
  const row = expectRecord(value, path);

  return {
    id: expectPositiveInteger(row.id, `${path}.id`),
    nombre: expectString(row.nombre, `${path}.nombre`),
    requiereSeleccionCliente: expectBoolean(
      row.requiereSeleccionCliente,
      `${path}.requiereSeleccionCliente`
    ),
  };
};

const parseCatalogs = (
  value: unknown,
  path: string
): SesionesBiCatalogsApiResponse => {
  const row = expectRecord(value, path);

  return {
    reportes: expectArray(
      row.reportes,
      `${path}.reportes`,
      parseReportFilterOption
    ),
    usuarios: expectArray(
      row.usuarios,
      `${path}.usuarios`,
      parseFilterOption
    ),
    clientes: expectArray(
      row.clientes,
      `${path}.clientes`,
      parseFilterOption
    ),
    estados: expectArray(
      row.estados,
      `${path}.estados`,
      expectSessionState
    ),
  };
};

const parseSession = (
  value: unknown,
  path: string
): SesionBiRowApiResponse => {
  const row = expectRecord(value, path);

  return {
    idSesion: expectString(row.idSesion, `${path}.idSesion`),
    idUsuario: expectPositiveInteger(row.idUsuario, `${path}.idUsuario`),
    usuarioLogin: expectString(row.usuarioLogin, `${path}.usuarioLogin`),
    usuarioNombre: expectString(row.usuarioNombre, `${path}.usuarioNombre`),
    idOpcionReporte: expectPositiveInteger(
      row.idOpcionReporte,
      `${path}.idOpcionReporte`
    ),
    reporteNombre: expectString(row.reporteNombre, `${path}.reporteNombre`),
    idCliente: expectNullablePositiveInteger(
      row.idCliente,
      `${path}.idCliente`
    ),
    clienteNombre: expectNullableString(
      row.clienteNombre,
      `${path}.clienteNombre`
    ),
    fechaInicioUtc: expectIsoDateTime(
      row.fechaInicioUtc,
      `${path}.fechaInicioUtc`
    ),
    fechaUltimoHeartbeatUtc: expectIsoDateTime(
      row.fechaUltimoHeartbeatUtc,
      `${path}.fechaUltimoHeartbeatUtc`
    ),
    fechaFinUtc: expectNullableIsoDateTime(
      row.fechaFinUtc,
      `${path}.fechaFinUtc`
    ),
    segundosVisibles: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
    estaVisible: expectBoolean(row.estaVisible, `${path}.estaVisible`),
    estado: expectSessionState(row.estado, `${path}.estado`),
    motivoCierre: expectNullableString(
      row.motivoCierre,
      `${path}.motivoCierre`
    ),
  };
};

const parseEvent = (
  value: unknown,
  path: string
): SesionBiEventApiResponse => {
  const row = expectRecord(value, path);

  return {
    idEvento: expectPositiveInteger(row.idEvento, `${path}.idEvento`),
    tipoEvento: expectString(row.tipoEvento, `${path}.tipoEvento`),
    fechaEventoUtc: expectIsoDateTime(
      row.fechaEventoUtc,
      `${path}.fechaEventoUtc`
    ),
    segundosVisibles: expectNonNegativeInteger(
      row.segundosVisibles,
      `${path}.segundosVisibles`
    ),
    origen: expectString(row.origen, `${path}.origen`),
    detalle: expectNullableString(row.detalle, `${path}.detalle`),
  };
};

export const parseSesionesBiPanelApiResponse = (
  value: unknown
): SesionesBiPanelApiResponse => {
  const row = expectRecord(value, '$');
  const sessions = expectRecord(row.sesiones, '$.sesiones');

  return {
    desdeUtc: expectIsoDateTime(row.desdeUtc, '$.desdeUtc'),
    hastaUtc: expectIsoDateTime(row.hastaUtc, '$.hastaUtc'),
    granularidadTendencia: expectString(
      row.granularidadTendencia,
      '$.granularidadTendencia'
    ),
    resumen: parseSummary(row.resumen, '$.resumen'),
    usoReportes: expectArray(
      row.usoReportes,
      '$.usoReportes',
      parseReportUsage
    ),
    usuariosMayorUso: expectArray(
      row.usuariosMayorUso,
      '$.usuariosMayorUso',
      parseUserUsage
    ),
    tendencia: expectArray(row.tendencia, '$.tendencia', parseTrend),
    catalogos: parseCatalogs(row.catalogos, '$.catalogos'),
    sesiones: {
      pagina: expectPositiveInteger(sessions.pagina, '$.sesiones.pagina'),
      tamanoPagina: expectPositiveInteger(
        sessions.tamanoPagina,
        '$.sesiones.tamanoPagina'
      ),
      total: expectNonNegativeInteger(sessions.total, '$.sesiones.total'),
      items: expectArray(
        sessions.items,
        '$.sesiones.items',
        parseSession
      ),
    },
  };
};

export const parseSesionBiDetailApiResponse = (
  value: unknown
): SesionBiDetailApiResponse => {
  const row = expectRecord(value, '$');

  return {
    sesion: parseSession(row.sesion, '$.sesion'),
    segundosTranscurridos: expectNonNegativeInteger(
      row.segundosTranscurridos,
      '$.segundosTranscurridos'
    ),
    segundosNoVisiblesEstimados: expectNonNegativeInteger(
      row.segundosNoVisiblesEstimados,
      '$.segundosNoVisiblesEstimados'
    ),
    eventos: expectArray(row.eventos, '$.eventos', parseEvent),
  };
};
