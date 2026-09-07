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
  getAnalyticsPowerBiViewerContext,
} from '../../../access/api/analyticsAccess.api';

import type {
  AnalyticsPowerBiClientSelectionStatus,
  AnalyticsReportClientOption,
} from '../../../access/types/analyticsAccess.types';

import {
  findAuthorizedOptionById,
  resolvePowerBiEmbedUrl,
  resolvePowerBiPublishToWebUrl,
} from '../utils/reporteria.utils';

import {
  parseReportClientSelection,
} from '../utils/reporteriaClientScope.utils';

type ViewerAnalyticsAccessState =
  | {
      key: string;
      status: 'error';
    }
  | {
      key: string;
      status: 'ready';
      allowed: boolean;
      clientSelectionStatus: AnalyticsPowerBiClientSelectionStatus;
      selectedClient: AnalyticsReportClientOption | null;
      scopedEmbedUrl: string | null;
    };

interface UsePowerBiViewerAccessParams {
  optionIdParam: string | undefined;
  routeSearch: string;
  status: AccessControlStatus;
  menuTree: readonly AuthorizedOption[];
}

export const usePowerBiViewerAccess = ({
  optionIdParam,
  routeSearch,
  status,
  menuTree,
}: UsePowerBiViewerAccessParams) => {
  const optionId = Number(optionIdParam);
  const accessRequestKey = `${optionId}:${routeSearch}`;

  const reporteria = useMemo(
    () =>
      findAuthorizedOptionById(
        menuTree,
        APPLICATION_OPTION_IDS.REPORTERIA
      ),
    [menuTree]
  );

  const report = useMemo(
    () =>
      Number.isSafeInteger(optionId) &&
      optionId > 0
        ? findAuthorizedOptionById(
            menuTree,
            optionId
          )
        : null,
    [menuTree, optionId]
  );

  const isValidReport = Boolean(
    report &&
      report.parentId ===
        APPLICATION_OPTION_IDS.REPORTERIA &&
      report.permissions.consultar
  );

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

    void (async () => {
      try {
        const requestedClient =
          parseReportClientSelection(
            new URLSearchParams(routeSearch)
          );
        const context =
          await getAnalyticsPowerBiViewerContext(
            optionId,
            requestedClient,
            controller.signal
          );

        if (!active) {
          return;
        }

        setAnalyticsAccess({
          key: accessRequestKey,
          status: 'ready',
          allowed: context.allowed,
          clientSelectionStatus:
            context.clientSelectionStatus,
          selectedClient:
            context.selectedClient,
          scopedEmbedUrl: context.embedUrl,
        });
      } catch {
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
      }
    })();

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

  const baseEmbedUrl = isValidReport
    ? resolvePowerBiEmbedUrl(report?.urlBI ?? null)
    : null;

  const selectedClient =
    currentAnalyticsAccess?.status === 'ready'
      ? currentAnalyticsAccess.selectedClient
      : null;

  const requiresScopedEmbed =
    selectedClient !== null;

  const rawScopedEmbedUrl =
    currentAnalyticsAccess?.status === 'ready'
      ? currentAnalyticsAccess.scopedEmbedUrl
      : null;

  const scopedEmbedUrl =
    resolvePowerBiPublishToWebUrl(
      rawScopedEmbedUrl
    );

  const embedUrl = requiresScopedEmbed
    ? scopedEmbedUrl
    : baseEmbedUrl;

  return {
    reporteriaName:
      reporteria?.name || 'Reportería',
    report,
    isValidReport,
    analyticsAccess: currentAnalyticsAccess,
    isAnalyticsAccessLoading,
    baseEmbedUrl,
    requiresScopedEmbed,
    rawScopedEmbedUrl,
    embedUrl,
  };
};
