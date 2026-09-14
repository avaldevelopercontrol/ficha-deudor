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

type ViewerAccesoAnaliticaState =
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

  const [accesoAnalitica, setAccesoAnalitica] =
    useState<ViewerAccesoAnaliticaState | null>(null);

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

        setAccesoAnalitica({
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

        setAccesoAnalitica({
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

  const currentAccesoAnalitica =
    accesoAnalitica?.key === accessRequestKey
      ? accesoAnalitica
      : null;

  const isAccesoAnaliticaLoading =
    status === 'ready' &&
    isValidReport &&
    currentAccesoAnalitica === null;

  const currentAccess =
    currentAccesoAnalitica?.status === 'ready'
      ? currentAccesoAnalitica.access
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
    accesoAnalitica:
      currentAccesoAnalitica?.status === 'ready'
        ? {
            key: currentAccesoAnalitica.key,
            status: 'ready' as const,
            ...currentAccesoAnalitica.access,
          }
        : currentAccesoAnalitica,
    isAccesoAnaliticaLoading,
    ...embedState,
  };
};
