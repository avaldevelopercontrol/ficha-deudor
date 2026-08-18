export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "",
  analyticsApiBaseUrl:
    import.meta.env.VITE_ANALYTICS_API_BASE_URL || "/analytics-api",
  analyticsUseMocks:
    import.meta.env.VITE_ANALYTICS_USE_MOCKS === "true",
  useMocks: import.meta.env.VITE_USE_MOCKS === "true",
  useClientesMock: import.meta.env.VITE_USE_CLIENTES_MOCK === "true",
  useDocumentosMock: import.meta.env.VITE_USE_DOCUMENTOS_MOCK === "true",
};