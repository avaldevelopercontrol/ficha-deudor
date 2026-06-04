const getBooleanEnv = (value: string | undefined): boolean => {
  return value === "true";
};

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
  useMocks: getBooleanEnv(import.meta.env.VITE_USE_MOCKS),
};