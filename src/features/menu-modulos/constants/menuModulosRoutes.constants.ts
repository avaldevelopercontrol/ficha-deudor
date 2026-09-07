import { AUTH_ROUTES } from '@features/auth/constants';
import { GESTION_COBRANZAS_ROUTES } from '@features/gestion-cobranzas/constants/gestionCobranzasRoutes.constants';

export const MENU_MODULOS_ROUTES = {
  MENU_MODULOS: AUTH_ROUTES.MENU_MODULOS,
  GESTION_DEUDOR:
    GESTION_COBRANZAS_ROUTES.GESTION_DEUDOR,
} as const;