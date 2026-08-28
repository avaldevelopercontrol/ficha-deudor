import type {
  AnalyticsReportClientOption,
} from '../../../access/types/analyticsAccess.types';

import {
  REPORTERIA_QUERY_PARAMS,
} from '../../../constants/reporteriaRoutes.constants';

const normalizeReportClientName = (
  value: string
): string =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('es-PE');

export const parseReportClientSelection = (
  searchParams: URLSearchParams
): AnalyticsReportClientOption | null => {
  const rawClientId = searchParams.get(
    REPORTERIA_QUERY_PARAMS.CLIENT_ID
  );
  const name = searchParams
    .get(REPORTERIA_QUERY_PARAMS.REPORT_CLIENT)
    ?.trim();
  const clientId = Number(rawClientId);

  if (
    !Number.isSafeInteger(clientId) ||
    clientId <= 0 ||
    !name
  ) {
    return null;
  }

  return {
    clientId,
    name,
  };
};

export const findAuthorizedReportClient = (
  clients: readonly AnalyticsReportClientOption[],
  requestedClient: AnalyticsReportClientOption | null
): AnalyticsReportClientOption | null => {
  if (!requestedClient) {
    return null;
  }

  const normalizedRequestedName =
    normalizeReportClientName(
      requestedClient.name
    );

  return (
    clients.find(
      (client) =>
        client.clientId ===
          requestedClient.clientId &&
        normalizeReportClientName(
          client.name
        ) === normalizedRequestedName
    ) ?? null
  );
};
