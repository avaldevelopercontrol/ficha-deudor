import {
  fetchSesionBiDetail,
  fetchSesionesBiPanel,
} from '../api/sesionesBiApi';
import type {
  SesionBiDetail,
  SesionesBiPanel,
  SesionesBiPanelFilters,
} from '../domain/sesionesBi.types';

export const getSesionesBiPanelResourceKey = (
  filters: SesionesBiPanelFilters
) => [
  filters.fromUtc,
  filters.toUtc,
  filters.reportId,
  filters.userId,
  filters.clientId,
  filters.status,
  filters.order,
  filters.page,
  filters.pageSize,
] as const;

export const getSesionBiDetailResourceKey = (
  sessionId: string | null
) => [sessionId] as const;

export const loadSesionesBiPanel = (
  filters: SesionesBiPanelFilters,
  signal: AbortSignal
): Promise<SesionesBiPanel> =>
  fetchSesionesBiPanel(filters, signal);

export const loadSesionBiDetail = (
  sessionId: string,
  signal: AbortSignal
): Promise<SesionBiDetail> =>
  fetchSesionBiDetail(sessionId, signal);
