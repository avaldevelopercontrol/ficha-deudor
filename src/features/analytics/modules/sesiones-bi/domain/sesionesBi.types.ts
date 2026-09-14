export type SesionBiEstado =
  | 'ACTIVA'
  | 'PAUSADA'
  | 'CERRADA'
  | 'EXPIRADA';

export type SesionesBiOrden =
  | 'inicio_desc'
  | 'tiempo_desc'
  | 'usuario_asc'
  | 'reporte_asc';

export type SesionesBiPeriodoPreset =
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'CUSTOM';

export interface SesionesBiPanelFilters {
  fromUtc: string;
  toUtc: string;
  reportId: number | null;
  userId: number | null;
  clientId: number | null;
  status: SesionBiEstado | null;
  search: string;
  order: SesionesBiOrden;
  page: number;
  pageSize: number;
}

export interface SesionesBiSummary {
  activeSessions: number;
  totalSessions: number;
  uniqueUsers: number;
  visibleSeconds: number;
  averageSecondsPerSession: number;
}

export interface SesionesBiReportUsage {
  reportId: number;
  reportName: string;
  sessions: number;
  uniqueUsers: number;
  visibleSeconds: number;
}

export interface SesionesBiUserUsage {
  userId: number;
  userLogin: string;
  userName: string;
  sessions: number;
  uniqueReports: number;
  visibleSeconds: number;
}

export interface SesionesBiTrendPoint {
  periodUtc: string;
  sessions: number;
  uniqueUsers: number;
  visibleSeconds: number;
}

export interface SesionesBiFilterOption {
  id: number;
  name: string;
}

export interface SesionesBiReportFilterOption extends SesionesBiFilterOption {
  requiresClientSelection: boolean;
}

export interface SesionesBiCatalogs {
  reports: readonly SesionesBiReportFilterOption[];
  users: readonly SesionesBiFilterOption[];
  clients: readonly SesionesBiFilterOption[];
  statuses: readonly SesionBiEstado[];
}

export interface SesionBiRow {
  sessionId: string;
  userId: number;
  userLogin: string;
  userName: string;
  reportId: number;
  reportName: string;
  clientId: number | null;
  clientName: string | null;
  startedAtUtc: string;
  lastHeartbeatAtUtc: string;
  endedAtUtc: string | null;
  visibleSeconds: number;
  isVisible: boolean;
  status: SesionBiEstado;
  closeReason: string | null;
}

export interface SesionesBiPageData {
  page: number;
  pageSize: number;
  total: number;
  items: readonly SesionBiRow[];
}

export interface SesionesBiPanel {
  fromUtc: string;
  toUtc: string;
  trendGranularity: string;
  summary: SesionesBiSummary;
  reportUsage: readonly SesionesBiReportUsage[];
  topUsers: readonly SesionesBiUserUsage[];
  trend: readonly SesionesBiTrendPoint[];
  catalogs: SesionesBiCatalogs;
  sessions: SesionesBiPageData;
}

export interface SesionBiEvent {
  eventId: number;
  eventType: string;
  eventAtUtc: string;
  visibleSeconds: number;
  origin: string;
  detail: string | null;
}

export interface SesionBiDetail {
  session: SesionBiRow;
  elapsedSeconds: number;
  estimatedHiddenSeconds: number;
  events: readonly SesionBiEvent[];
}
