import {
  getAnalyticsPowerBiViewerContext,
} from '../../../access/api/analyticsAccess.api';
import type {
  AnalyticsPowerBiClientSelectionStatus,
  AnalyticsPowerBiViewerContext,
  AnalyticsReportClientOption,
} from '../../../access/domain/analyticsAccess.types';
import type {
  PowerBiReport,
  ReporteriaCatalog,
} from '../domain/reporteria.types';
import {
  findPowerBiReportById,
  resolvePowerBiEmbedUrl,
  resolvePowerBiPublishToWebUrl,
} from '../utils/reporteria.utils';
import {
  parseReportClientSelection,
} from '../utils/reporteriaClientScope.utils';

export interface ReporteriaViewerAccess {
  allowed: boolean;
  clientSelectionStatus: AnalyticsPowerBiClientSelectionStatus;
  selectedClient: AnalyticsReportClientOption | null;
  scopedEmbedUrl: string | null;
}

export interface ReporteriaViewerEmbedState {
  baseEmbedUrl: string | null;
  requiresScopedEmbed: boolean;
  rawScopedEmbedUrl: string | null;
  embedUrl: string | null;
}

interface ReporteriaViewerDependencies {
  getViewerContext: (
    optionId: number,
    client: AnalyticsReportClientOption | null,
    signal?: AbortSignal
  ) => Promise<AnalyticsPowerBiViewerContext>;
}

const defaultDependencies: ReporteriaViewerDependencies = {
  getViewerContext:
    getAnalyticsPowerBiViewerContext,
};

export const resolvePowerBiViewerReport = (
  catalog: ReporteriaCatalog,
  optionIdParam: string | undefined
): {
  optionId: number;
  report: PowerBiReport | null;
} => {
  const optionId = Number(optionIdParam);

  return {
    optionId,
    report:
      Number.isSafeInteger(optionId) &&
      optionId > 0
        ? findPowerBiReportById(
            catalog.reports,
            optionId
          )
        : null,
  };
};

export const loadPowerBiViewerAccess = async (
  optionId: number,
  routeSearch: string,
  signal?: AbortSignal,
  dependencies: ReporteriaViewerDependencies =
    defaultDependencies
): Promise<ReporteriaViewerAccess> => {
  const requestedClient =
    parseReportClientSelection(
      new URLSearchParams(routeSearch)
    );
  const context =
    await dependencies.getViewerContext(
      optionId,
      requestedClient,
      signal
    );

  return {
    allowed: context.allowed,
    clientSelectionStatus:
      context.clientSelectionStatus,
    selectedClient: context.selectedClient,
    scopedEmbedUrl: context.embedUrl,
  };
};

export const resolvePowerBiViewerEmbedState = (
  report: PowerBiReport | null,
  access: ReporteriaViewerAccess | null
): ReporteriaViewerEmbedState => {
  const baseEmbedUrl = report
    ? resolvePowerBiEmbedUrl(report.serviceUrl)
    : null;
  const selectedClient =
    access?.selectedClient ?? null;
  const requiresScopedEmbed =
    selectedClient !== null;
  const rawScopedEmbedUrl =
    access?.scopedEmbedUrl ?? null;
  const scopedEmbedUrl =
    resolvePowerBiPublishToWebUrl(
      rawScopedEmbedUrl
    );

  return {
    baseEmbedUrl,
    requiresScopedEmbed,
    rawScopedEmbedUrl,
    embedUrl: requiresScopedEmbed
      ? scopedEmbedUrl
      : baseEmbedUrl,
  };
};
