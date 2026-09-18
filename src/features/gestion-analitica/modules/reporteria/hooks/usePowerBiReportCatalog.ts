import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  accesoAnaliticaReporteriaAdapter,
} from '../adapters/accesoAnaliticaReporteria.adapter';
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

  const [accesoAnalitica, setAccesoAnalitica] =
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
      controller.signal,
      accesoAnaliticaReporteriaAdapter
    )
      .then((access) => {
        if (!active) {
          return;
        }

        setAccesoAnalitica({
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

        setAccesoAnalitica({
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

  const currentAccesoAnalitica =
    accesoAnalitica?.key === reportAccessKey
      ? accesoAnalitica
      : null;

  const isAccesoAnaliticaLoading =
    status === 'ready' &&
    reports.length > 0 &&
    currentAccesoAnalitica === null;

  const analyticsReports = useMemo(() => {
    if (!currentAccesoAnalitica) {
      return [];
    }

    const allowedIds = new Set(
      currentAccesoAnalitica.access.allowedReportIds
    );

    return reports.filter((report) =>
      allowedIds.has(report.id)
    );
  }, [currentAccesoAnalitica, reports]);

  const clientScopedReportIds = useMemo(
    () =>
      new Set(
        currentAccesoAnalitica?.access
          .clientScopedReportIds ?? []
      ),
    [currentAccesoAnalitica]
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
    hasAccesoAnaliticaErrors:
      currentAccesoAnalitica?.hasErrors === true,
    isAccesoAnaliticaReady:
      currentAccesoAnalitica !== null,
    isAccesoAnaliticaLoading,
    setSelectedReportIds,
  };
};
