import { matchPath } from 'react-router-dom';

import {
  APPLICATION_OPTION_IDS,
  type AuthorizedOption,
} from '@features/access-control';

import { AUTH_ROUTES } from '@features/auth/constants';
import { FICHA_DEUDOR_ROUTES } from '@features/ficha-deudor/shared/constants/fichaDeudorRoutes.constants';

const MENU_MODULOS_HEADER = 'MENÚ DE MÓDULOS';
const FICHA_DEUDOR_HEADER = 'FICHA DEUDOR';

const matchesPath = (
  routePath: string | null | undefined,
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

const findOptionPath = (
  options: readonly AuthorizedOption[],
  predicate: (option: AuthorizedOption) => boolean,
  ancestors: readonly AuthorizedOption[] = []
): AuthorizedOption[] | null => {
  for (const option of options) {
    const currentPath = [
      ...ancestors,
      option,
    ];

    if (predicate(option)) {
      return currentPath;
    }

    const childPath = findOptionPath(
      option.children,
      predicate,
      currentPath
    );

    if (childPath) {
      return childPath;
    }
  }

  return null;
};

const formatOptionPath = (
  options: readonly AuthorizedOption[]
): string =>
  options
    .map((option) =>
      option.name
        .trim()
        .toLocaleUpperCase('es-PE')
    )
    .filter(Boolean)
    .join(' › ');

export const getAppBreadcrumb = (
  pathname: string,
  navigationTree: readonly AuthorizedOption[] = []
): string => {
  if (
    matchesPath(
      AUTH_ROUTES.MENU_MODULOS,
      pathname
    )
  ) {
    return MENU_MODULOS_HEADER;
  }

  if (
    matchesPath(
      FICHA_DEUDOR_ROUTES.FICHA_DEUDOR,
      pathname
    ) ||
    matchesPath(
      FICHA_DEUDOR_ROUTES.LEGACY_FICHA_DEUDOR,
      pathname
    )
  ) {
    const gestionDeudorPath =
      findOptionPath(
        navigationTree,
        (option) =>
          option.id ===
          APPLICATION_OPTION_IDS
            .GESTION_DEUDOR
      );

    const parentBreadcrumb =
      gestionDeudorPath
        ? formatOptionPath(
            gestionDeudorPath
          )
        : 'GESTIÓN DE COBRANZAS › GESTIÓN DEUDOR';

    return `${parentBreadcrumb} › ${FICHA_DEUDOR_HEADER}`;
  }

  const optionPath = findOptionPath(
    navigationTree,
    (option) =>
      matchesPath(
        option.route,
        pathname
      )
  );

  if (optionPath) {
    return formatOptionPath(
      optionPath
    );
  }

  return MENU_MODULOS_HEADER;
};
