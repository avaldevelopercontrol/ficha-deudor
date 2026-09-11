import {
  getAnalyticsPowerBiOptionAccess,
} from '../../../access/api/analyticsAccess.api';
import type {
  AnalyticsPowerBiOptionAccess,
} from '../../../access/domain/analyticsAccess.types';
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
  const access =
    await dependencies.getPowerBiOptionAccess(
      reports.map((report) => report.id),
      signal
    );

  return {
    allowedReportIds: access.flatMap(
      (option) =>
        option.allowed
          ? [option.optionId]
          : []
    ),
    clientScopedReportIds: access.flatMap(
      (option) =>
        option.allowed &&
        option.requiresClientSelection
          ? [option.optionId]
          : []
    ),
  };
};
