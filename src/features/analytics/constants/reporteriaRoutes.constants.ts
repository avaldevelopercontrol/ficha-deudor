export const REPORTERIA_ROUTES = {
  ROOT: '/analytics/reporteria',
  POWER_BI: '/analytics/reporteria/bi/:optionId',
} as const;

export const buildReporteriaBiRoute = (
  optionId: number
): string =>
  `/analytics/reporteria/bi/${optionId}`;
