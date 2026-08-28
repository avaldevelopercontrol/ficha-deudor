import type {
  AnalyticsReportClientOption,
} from '../access/types/analyticsAccess.types';

export const REPORTERIA_ROUTES = {
  ROOT: '/analytics/reporteria',
  POWER_BI: '/analytics/reporteria/bi/:optionId',
} as const;

export const REPORTERIA_QUERY_PARAMS = {
  CLIENT_ID: 'clientId',
  REPORT_CLIENT: 'reportClient',
} as const;

export const buildReporteriaBiRoute = (
  optionId: number,
  client?: AnalyticsReportClientOption
): string => {
  const path = `/analytics/reporteria/bi/${optionId}`;

  if (!client) {
    return path;
  }

  const params = new URLSearchParams({
    [REPORTERIA_QUERY_PARAMS.CLIENT_ID]:
      String(client.clientId),
    [REPORTERIA_QUERY_PARAMS.REPORT_CLIENT]:
      client.name,
  });

  return `${path}?${params.toString()}`;
};
