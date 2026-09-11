import {
  getAnalyticsReportClients,
} from '../../../access/api/analyticsAccess.api';
import type {
  AnalyticsReportClientOption,
} from '../../../access/domain/analyticsAccess.types';
import {
  buildReporteriaBiRoute,
} from '../../../constants/reporteriaRoutes.constants';
import type {
  PowerBiReport,
} from '../domain/reporteria.types';

export type PowerBiReportOpenResolution =
  | {
      kind: 'navigate';
      route: string;
    }
  | {
      kind: 'client-selection';
      clients: readonly AnalyticsReportClientOption[];
    };

interface ReporteriaNavigationDependencies {
  getReportClients: (
    optionId: number,
    signal?: AbortSignal
  ) => Promise<AnalyticsReportClientOption[]>;
}

const defaultDependencies: ReporteriaNavigationDependencies = {
  getReportClients: getAnalyticsReportClients,
};

export const resolvePowerBiReportOpen = async (
  report: PowerBiReport,
  requiresClientSelection: boolean,
  signal?: AbortSignal,
  dependencies: ReporteriaNavigationDependencies =
    defaultDependencies
): Promise<PowerBiReportOpenResolution> => {
  if (!requiresClientSelection) {
    return {
      kind: 'navigate',
      route: buildReporteriaBiRoute(report.id),
    };
  }

  const clients =
    await dependencies.getReportClients(
      report.id,
      signal
    );

  if (clients.length === 1) {
    return {
      kind: 'navigate',
      route: buildReporteriaBiRoute(
        report.id,
        clients[0]
      ),
    };
  }

  return {
    kind: 'client-selection',
    clients,
  };
};

export const buildPowerBiReportRoute = (
  report: PowerBiReport,
  client?: AnalyticsReportClientOption
): string =>
  buildReporteriaBiRoute(report.id, client);
