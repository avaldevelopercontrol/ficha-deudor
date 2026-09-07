import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  APPLICATION_OPTION_IDS,
  type AccessControlStatus,
  type AuthorizedOption,
} from '@features/access-control';

import {
  getAnalyticsPowerBiOptionAccess,
} from '../../../access/api/analyticsAccess.api';

import {
  buildPowerBiReportAccessKey,
  filterPowerBiReportsBySelection,
  findAuthorizedOptionById,
  getAuthorizedPowerBiReports,
  retainAvailablePowerBiReportIds,
} from '../utils/reporteria.utils';

interface AnalyticsReportAccessState {
  key: string;
  allowedReportIds: readonly number[];
  clientScopedReportIds: readonly number[];
  hasErrors: boolean;
}

interface UsePowerBiReportCatalogParams {
  status: AccessControlStatus;
  menuTree: readonly AuthorizedOption[];
}

export const usePowerBiReportCatalog = ({
  status,
  menuTree,
}: UsePowerBiReportCatalogParams) => {
  const [selectedReportIds, setSelectedReportIds] =
    useState<number[]>([]);

  const [analyticsAccess, setAnalyticsAccess] =
    useState<AnalyticsReportAccessState | null>(null);

  const reporteriaOption = useMemo(
    () =>
      findAuthorizedOptionById(
        menuTree,
        APPLICATION_OPTION_IDS.REPORTERIA
      ),
    [menuTree]
  );

  const parentOption = useMemo(
    () =>
      reporteriaOption
        ? findAuthorizedOptionById(
            menuTree,
            reporteriaOption.parentId
          )
        : null,
    [menuTree, reporteriaOption]
  );

  const reports = useMemo(
    () => getAuthorizedPowerBiReports(menuTree),
    [menuTree]
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

    void getAnalyticsPowerBiOptionAccess(
      reports.map((report) => report.id),
      controller.signal
    )
      .then((access) => {
        if (!active) {
          return;
        }

        setAnalyticsAccess({
          key: reportAccessKey,
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
          allowedReportIds: [],
          clientScopedReportIds: [],
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
      currentAnalyticsAccess.allowedReportIds
    );

    return reports.filter((report) =>
      allowedIds.has(report.id)
    );
  }, [currentAnalyticsAccess, reports]);

  const clientScopedReportIds = useMemo(
    () =>
      new Set(
        currentAnalyticsAccess
          ?.clientScopedReportIds ?? []
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
    reporteriaOption,
    parentOption,
    reporteriaName:
      reporteriaOption?.name || 'Reportería',
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
