import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  loadReporteriaReportAccess,
  type ReporteriaReportAccess,
} from '../application/reporteriaCatalog.application';
import type {
  ReporteriaAccessStatus,
  ReporteriaCatalog,
} from '../domain/reporteria.types';
import {
  buildPowerBiReportAccessKey,
  filterPowerBiReportsBySelection,
  getAvailablePowerBiReports,
  retainAvailablePowerBiReportIds,
} from '../utils/reporteria.utils';

interface AnalyticsReportAccessState {
  key: string;
  access: ReporteriaReportAccess;
  hasErrors: boolean;
}

interface UsePowerBiReportCatalogParams {
  status: ReporteriaAccessStatus;
  catalog: ReporteriaCatalog;
}

export const usePowerBiReportCatalog = ({
  status,
  catalog,
}: UsePowerBiReportCatalogParams) => {
  const [selectedReportIds, setSelectedReportIds] =
    useState<number[]>([]);

  const [analyticsAccess, setAnalyticsAccess] =
    useState<AnalyticsReportAccessState | null>(null);

  const reports = useMemo(
    () => getAvailablePowerBiReports(catalog.reports),
    [catalog.reports]
  );

  const reportAccessKey = useMemo(
    () => buildPowerBiReportAccessKey(reports),
    [reports]
  );

  useEffect(() => {
    if (
      status !== 'ready' ||
      reports.length === 0
    ) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    void loadReporteriaReportAccess(
      reports,
      controller.signal
    )
      .then((access) => {
        if (!active) {
          return;
        }

        setAnalyticsAccess({
          key: reportAccessKey,
          access,
          hasErrors: false,
        });
      })
      .catch(() => {
        if (
          !active ||
          controller.signal.aborted
        ) {
          return;
        }

        setAnalyticsAccess({
          key: reportAccessKey,
          access: {
            allowedReportIds: [],
            clientScopedReportIds: [],
          },
          hasErrors: true,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reportAccessKey, reports, status]);

  const currentAnalyticsAccess =
    analyticsAccess?.key === reportAccessKey
      ? analyticsAccess
      : null;

  const isAnalyticsAccessLoading =
    status === 'ready' &&
    reports.length > 0 &&
    currentAnalyticsAccess === null;

  const analyticsReports = useMemo(() => {
    if (!currentAnalyticsAccess) {
      return [];
    }

    const allowedIds = new Set(
      currentAnalyticsAccess.access.allowedReportIds
    );

    return reports.filter((report) =>
      allowedIds.has(report.id)
    );
  }, [currentAnalyticsAccess, reports]);

  const clientScopedReportIds = useMemo(
    () =>
      new Set(
        currentAnalyticsAccess?.access
          .clientScopedReportIds ?? []
      ),
    [currentAnalyticsAccess]
  );

  const effectiveSelectedReportIds = useMemo(
    () =>
      retainAvailablePowerBiReportIds(
        analyticsReports,
        selectedReportIds
      ),
    [analyticsReports, selectedReportIds]
  );

  const filteredReports = useMemo(
    () =>
      filterPowerBiReportsBySelection(
        analyticsReports,
        effectiveSelectedReportIds
      ),
    [analyticsReports, effectiveSelectedReportIds]
  );

  return {
    reporteriaOption: catalog.section,
    parentName: catalog.parentName,
    reporteriaName:
      catalog.section?.name || 'Reportería',
    reports,
    analyticsReports,
    clientScopedReportIds,
    selectedReportIds:
      effectiveSelectedReportIds,
    filteredReports,
    hasAnalyticsAccessErrors:
      currentAnalyticsAccess?.hasErrors === true,
    isAnalyticsAccessReady:
      currentAnalyticsAccess !== null,
    isAnalyticsAccessLoading,
    setSelectedReportIds,
  };
};
