import {
  getAnalyticsPowerBiOptionAccess,
  getAnalyticsPowerBiViewerContext,
  getAnalyticsReportClients,
} from '../../../acceso/api/accesoAnalitica.api';
import type {
  ReporteriaCatalogDependencies,
} from '../application/reporteriaCatalog.application';
import type {
  ReporteriaNavigationDependencies,
} from '../application/reporteriaNavigation.application';
import type {
  ReporteriaViewerDependencies,
} from '../application/reporteriaViewer.application';

type ReporteriaAccesoAnaliticaAdapter =
  ReporteriaCatalogDependencies &
  ReporteriaNavigationDependencies &
  ReporteriaViewerDependencies;

export const accesoAnaliticaReporteriaAdapter = {
  getPowerBiOptionAccess:
    getAnalyticsPowerBiOptionAccess,
  getReportClients: getAnalyticsReportClients,
  getViewerContext:
    getAnalyticsPowerBiViewerContext,
} satisfies ReporteriaAccesoAnaliticaAdapter;
