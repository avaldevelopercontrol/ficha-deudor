import { SEGURIDAD_ROUTES } from './seguridadRoutes.constants';

export interface SeguridadSidebarItem {
  label: string;
  to: string;
}

export const SEGURIDAD_SIDEBAR_ITEMS: SeguridadSidebarItem[] = [
  {
    label: 'Mantener perfil',
    to: SEGURIDAD_ROUTES.MANTENER_PERFIL,
  },
  {
    label: 'Mantener módulo',
    to: SEGURIDAD_ROUTES.MANTENER_MODULOS,
  },
  {
    label: 'Mantener grupo',
    to: SEGURIDAD_ROUTES.MANTENER_GRUPO,
  },
  {
    label: 'Mantener accesos por perfil',
    to: SEGURIDAD_ROUTES.MANTENER_ACCESOS_PERFIL,
  },
];
