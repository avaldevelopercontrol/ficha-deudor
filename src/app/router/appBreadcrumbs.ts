import { matchPath } from 'react-router-dom';

import { AUTH_ROUTES } from '@features/auth/constants';
import { FICHA_DEUDOR_ROUTES } from '@features/ficha-deudor/shared/constants/fichaDeudorRoutes.constants';
import { MENU_MODULOS } from '@features/menu-modulos/data';
import type { MenuModulo } from '@features/menu-modulos/types';

const MENU_MODULOS_HEADER = 'MENÚ DE MÓDULOS';
const FICHA_DEUDOR_HEADER = 'FICHA DEUDOR';

const GESTION_COBRANZA_KEY = 'gestion-cobranza';
const GESTION_DEUDOR_KEY = 'gestion-deudor';

const getBreadcrumbLabel = (modulo: MenuModulo): string => {
  return modulo.breadcrumbLabel ?? modulo.label;
};

const matchesPath = (
  routePath: string | undefined,
  pathname: string
): boolean => {
  if (!routePath) {
    return false;
  }

  return Boolean(
    matchPath(
      {
        path: routePath,
        end: true,
      },
      pathname
    )
  );
};

const findMenuBreadcrumb = (pathname: string): string | null => {
  for (const modulo of MENU_MODULOS) {
    if (matchesPath(modulo.path, pathname)) {
      return getBreadcrumbLabel(modulo);
    }

    const child = modulo.children?.find((item) =>
      matchesPath(item.path, pathname)
    );

    if (child) {
      return `${getBreadcrumbLabel(modulo)} › ${getBreadcrumbLabel(child)}`;
    }
  }

  return null;
};

const findModuleByKey = (
  moduleKey: string
): MenuModulo | undefined => {
  for (const modulo of MENU_MODULOS) {
    if (modulo.key === moduleKey) {
      return modulo;
    }

    const child = modulo.children?.find(
      (item) => item.key === moduleKey
    );

    if (child) {
      return child;
    }
  }

  return undefined;
};

const getModuleLabelByKey = (
  moduleKey: string,
  fallback: string
): string => {
  const modulo = findModuleByKey(moduleKey);

  return modulo
    ? getBreadcrumbLabel(modulo)
    : fallback;
};

export const getAppBreadcrumb = (pathname: string): string => {
  if (matchesPath(AUTH_ROUTES.MENU_MODULOS, pathname)) {
    return MENU_MODULOS_HEADER;
  }

  const menuBreadcrumb = findMenuBreadcrumb(pathname);

  if (menuBreadcrumb) {
    return menuBreadcrumb;
  }

  if (matchesPath(FICHA_DEUDOR_ROUTES.FICHA_DEUDOR, pathname)) {
    const gestionCobranzaLabel = getModuleLabelByKey(
      GESTION_COBRANZA_KEY,
      'GESTIÓN DE COBRANZAS'
    );

    const gestionDeudorLabel = getModuleLabelByKey(
      GESTION_DEUDOR_KEY,
      'GESTIÓN POR PERSONA/DEUDOR'
    );

    return `${gestionCobranzaLabel} › ${gestionDeudorLabel} › ${FICHA_DEUDOR_HEADER}`;
  }

  return MENU_MODULOS_HEADER;
};