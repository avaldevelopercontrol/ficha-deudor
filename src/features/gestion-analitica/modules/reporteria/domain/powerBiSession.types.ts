import type {
  AnalyticsReportClientOption,
} from '../../../acceso/domain/accesoAnalitica.types';

export interface PowerBiSessionOpenInput {
  optionId: number;
  client: AnalyticsReportClientOption | null;
}

export interface PowerBiSessionOpened {
  sessionId: string;
  startedAtUtc: string;
}

export interface PowerBiSessionActivityInput {
  visibleSeconds: number;
  visible: boolean;
}

export type PowerBiSessionCloseReason =
  | 'NAVEGACION'
  | 'PAGEHIDE'
  | 'LOGOUT'
  | 'ERROR'
  | 'CAMBIO_REPORTE';

export interface PowerBiSessionCloseInput {
  visibleSeconds: number;
  reason: PowerBiSessionCloseReason;
}
