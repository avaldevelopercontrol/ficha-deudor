import type {
  SesionBiDetail,
  SesionBiEvent,
  SesionBiRow,
  SesionesBiCatalogs,
  SesionesBiFilterOption,
  SesionesBiPanel,
  SesionesBiReportFilterOption,
  SesionesBiReportUsage,
  SesionesBiSummary,
  SesionesBiTrendPoint,
  SesionesBiUserUsage,
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

const normalizeSummary = (
  value: SesionesBiSummaryApiResponse
): SesionesBiSummary => ({
  activeSessions: value.sesionesActivas,
  totalSessions: value.totalSesiones,
  uniqueUsers: value.usuariosUnicos,
  visibleSeconds: value.segundosVisibles,
  averageSecondsPerSession: value.promedioSegundosPorSesion,
});

const normalizeReportUsage = (
  value: SesionesBiReportUsageApiResponse
): SesionesBiReportUsage => ({
  reportId: value.idOpcionReporte,
  reportName: value.reporteNombre,
  sessions: value.sesiones,
  uniqueUsers: value.usuariosUnicos,
  visibleSeconds: value.segundosVisibles,
});

const normalizeUserUsage = (
  value: SesionesBiUserUsageApiResponse
): SesionesBiUserUsage => ({
  userId: value.idUsuario,
  userLogin: value.usuarioLogin,
  userName: value.usuarioNombre,
  sessions: value.sesiones,
  uniqueReports: value.reportesUnicos,
  visibleSeconds: value.segundosVisibles,
});

const normalizeTrendPoint = (
  value: SesionesBiTrendPointApiResponse
): SesionesBiTrendPoint => ({
  periodUtc: value.periodoUtc,
  sessions: value.sesiones,
  uniqueUsers: value.usuariosUnicos,
  visibleSeconds: value.segundosVisibles,
});

const normalizeFilterOption = (
  value: SesionesBiFilterOptionApiResponse
): SesionesBiFilterOption => ({
  id: value.id,
  name: value.nombre,
});

const normalizeReportFilterOption = (
  value: SesionesBiReportFilterOptionApiResponse
): SesionesBiReportFilterOption => ({
  id: value.id,
  name: value.nombre,
  requiresClientSelection: value.requiereSeleccionCliente,
});

const normalizeCatalogs = (
  value: SesionesBiCatalogsApiResponse
): SesionesBiCatalogs => ({
  reports: value.reportes.map(normalizeReportFilterOption),
  users: value.usuarios.map(normalizeFilterOption),
  clients: value.clientes.map(normalizeFilterOption),
  statuses: value.estados,
});

const normalizeSession = (
  value: SesionBiRowApiResponse
): SesionBiRow => ({
  sessionId: value.idSesion,
  userId: value.idUsuario,
  userLogin: value.usuarioLogin,
  userName: value.usuarioNombre,
  reportId: value.idOpcionReporte,
  reportName: value.reporteNombre,
  clientId: value.idCliente,
  clientName: value.clienteNombre,
  startedAtUtc: value.fechaInicioUtc,
  lastHeartbeatAtUtc: value.fechaUltimoHeartbeatUtc,
  endedAtUtc: value.fechaFinUtc,
  visibleSeconds: value.segundosVisibles,
  isVisible: value.estaVisible,
  status: value.estado,
  closeReason: value.motivoCierre,
});

const normalizeEvent = (
  value: SesionBiEventApiResponse
): SesionBiEvent => ({
  eventId: value.idEvento,
  eventType: value.tipoEvento,
  eventAtUtc: value.fechaEventoUtc,
  visibleSeconds: value.segundosVisibles,
  origin: value.origen,
  detail: value.detalle,
});

export const normalizeSesionesBiPanelApiResponse = (
  value: SesionesBiPanelApiResponse
): SesionesBiPanel => ({
  fromUtc: value.desdeUtc,
  toUtc: value.hastaUtc,
  trendGranularity: value.granularidadTendencia,
  summary: normalizeSummary(value.resumen),
  reportUsage: value.usoReportes.map(normalizeReportUsage),
  topUsers: value.usuariosMayorUso.map(normalizeUserUsage),
  trend: value.tendencia.map(normalizeTrendPoint),
  catalogs: normalizeCatalogs(value.catalogos),
  sessions: {
    page: value.sesiones.pagina,
    pageSize: value.sesiones.tamanoPagina,
    total: value.sesiones.total,
    items: value.sesiones.items.map(normalizeSession),
  },
});

export const normalizeSesionBiDetailApiResponse = (
  value: SesionBiDetailApiResponse
): SesionBiDetail => ({
  session: normalizeSession(value.sesion),
  elapsedSeconds: value.segundosTranscurridos,
  estimatedHiddenSeconds: value.segundosNoVisiblesEstimados,
  events: value.eventos.map(normalizeEvent),
});
