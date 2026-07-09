export const GESTION_DEUDOR_API_ENDPOINTS = {
  baseDeudor: '/v1/Deudor',
  getDeudor: '/GetDeudorAsync',
} as const;

export const GESTION_DEUDOR_API_DEFAULTS = {
  pageNumber: 1,
  pageSize: 1000,
} as const;
