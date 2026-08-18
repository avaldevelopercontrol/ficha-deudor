export const AUTH_ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  CAMBIAR_CLAVE_EXPIRADA: '/cambiar-clave-expirada',
  MENU_MODULOS: '/menu-modulos',
  GESTION_DEUDOR: '/gestion-cobranzas/gestion-deudor',
} as const;

export const PUBLIC_AUTH_PATHS = new Set<string>([
  AUTH_ROUTES.ROOT,
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.CAMBIAR_CLAVE_EXPIRADA,
]);
