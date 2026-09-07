export const GESTION_DEUDOR_API_ENDPOINTS = {
  baseDeudor: '/v1/Deudor',
  getDeudor: '/GetDeudor',
} as const;

export const GESTION_DEUDOR_API_DEFAULTS = {
  firstPageNumber: 1,
  pageSize: 1000,
} as const;
