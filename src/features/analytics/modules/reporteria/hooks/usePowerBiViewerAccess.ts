import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  loadPowerBiViewerAccess,
  resolvePowerBiViewerEmbedState,
  resolvePowerBiViewerReport,
  type ReporteriaViewerAccess,
} from '../application/reporteriaViewer.application';
import type {
  ReporteriaAccessStatus,
  ReporteriaCatalog,
} from '../domain/reporteria.types';

type ViewerAnalyticsAccessState =
  | {
      key: string;
      status: 'error';
    }
  | {
      key: string;
      status: 'ready';
      access: ReporteriaViewerAccess;
    };

interface UsePowerBiViewerAccessParams {
  optionIdParam: string | undefined;
  routeSearch: string;
  status: ReporteriaAccessStatus;
  catalog: ReporteriaCatalog;
}

export const usePowerBiViewerAccess = ({
  optionIdParam,
  routeSearch,
  status,
  catalog,
}: UsePowerBiViewerAccessParams) => {
  const { optionId, report } = useMemo(
    () =>
      resolvePowerBiViewerReport(
        catalog,
        optionIdParam
      ),
    [catalog, optionIdParam]
  );
  const accessRequestKey = `${optionId}:${routeSearch}`;
  const isValidReport = report !== null;

  const [analyticsAccess, setAnalyticsAccess] =
    useState<ViewerAnalyticsAccessState | null>(null);

  useEffect(() => {
    if (
      status !== 'ready' ||
      !isValidReport ||
      !Number.isSafeInteger(optionId) ||
      optionId <= 0
    ) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    void loadPowerBiViewerAccess(
      optionId,
      routeSearch,
      controller.signal
    )
      .then((access) => {
        if (!active) {
          return;
        }

        setAnalyticsAccess({
          key: accessRequestKey,
          status: 'ready',
          access,
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
          key: accessRequestKey,
          status: 'error',
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    accessRequestKey,
    isValidReport,
    optionId,
    routeSearch,
    status,
  ]);

  const currentAnalyticsAccess =
    analyticsAccess?.key === accessRequestKey
      ? analyticsAccess
      : null;

  const isAnalyticsAccessLoading =
    status === 'ready' &&
    isValidReport &&
    currentAnalyticsAccess === null;

  const currentAccess =
    currentAnalyticsAccess?.status === 'ready'
      ? currentAnalyticsAccess.access
      : null;

  const embedState =
    resolvePowerBiViewerEmbedState(
      report,
      currentAccess
    );

  return {
    reporteriaName:
      catalog.section?.name || 'Reportería',
    report,
    isValidReport,
    analyticsAccess:
      currentAnalyticsAccess?.status === 'ready'
        ? {
            key: currentAnalyticsAccess.key,
            status: 'ready' as const,
            ...currentAnalyticsAccess.access,
          }
        : currentAnalyticsAccess,
    isAnalyticsAccessLoading,
    ...embedState,
  };
};
