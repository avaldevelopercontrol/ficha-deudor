import {
  getAnalyticsPowerBiOptionAccess,
} from '../../../acceso/api/accesoAnalitica.api';
import type {
  AnalyticsPowerBiOptionAccess,
} from '../../../acceso/domain/accesoAnalitica.types';
import {
  bypassesAnalyticsGroupAccess,
  requiresExplicitClientSelection,
} from '../domain/reporteriaAccessPolicy';
import type {
  PowerBiReport,
} from '../domain/reporteria.types';

export interface ReporteriaReportAccess {
  allowedReportIds: readonly number[];
  clientScopedReportIds: readonly number[];
}

interface ReporteriaCatalogDependencies {
  getPowerBiOptionAccess: (
    optionIds: readonly number[],
    signal?: AbortSignal
  ) => Promise<AnalyticsPowerBiOptionAccess[]>;
}

const defaultDependencies: ReporteriaCatalogDependencies = {
  getPowerBiOptionAccess:
    getAnalyticsPowerBiOptionAccess,
};

export const loadReporteriaReportAccess = async (
  reports: readonly PowerBiReport[],
  signal?: AbortSignal,
  dependencies: ReporteriaCatalogDependencies =
    defaultDependencies
): Promise<ReporteriaReportAccess> => {
  const analyticsControlledReports =
    reports.filter(
      (report) =>
        !bypassesAnalyticsGroupAccess(report.id)
    );

  const access =
    analyticsControlledReports.length > 0
      ? await dependencies.getPowerBiOptionAccess(
          analyticsControlledReports.map(
            (report) => report.id
          ),
          signal
        )
      : [];

  const allowedByAnalytics = new Set(
    access.flatMap((option) =>
      option.allowed ? [option.optionId] : []
    )
  );
  const clientScopedByAnalytics = new Set(
    access.flatMap((option) =>
      option.allowed && option.requiresClientSelection
        ? [option.optionId]
        : []
    )
  );

  return {
    allowedReportIds: reports.flatMap((report) =>
      bypassesAnalyticsGroupAccess(report.id) ||
      allowedByAnalytics.has(report.id)
        ? [report.id]
        : []
    ),
    clientScopedReportIds: reports.flatMap(
      (report) =>
        requiresExplicitClientSelection(report.id) ||
        clientScopedByAnalytics.has(report.id)
          ? [report.id]
          : []
    ),
  };
};
