import type {
  AuthorizedOption,
} from '@features/access-control';

import type {
  MenuModulo,
} from '../types';

const AVAILABLE_BADGE =
  'Disponible';

const UPCOMING_BADGE =
  'Próximamente';

const NO_ACCESS_BADGE =
  'Sin permiso';

export const isPowerBiMenuOption = (
  option: AuthorizedOption
): boolean =>
  Boolean(option.urlBI?.trim());

const buildDescription = (
  option: AuthorizedOption
): string =>
  option.description ||
  `Acceso disponible a ${option.name}.`;

const getMenuChildren = (
  option: AuthorizedOption
): MenuModulo[] =>
  option.children
    .filter(
      (child) =>
        !isPowerBiMenuOption(child)
    )
    .map(
      mapAuthorizedOptionToMenuModulo
    );

const hasNavigableDestination = (
  option: AuthorizedOption
): boolean => {
  if (isPowerBiMenuOption(option)) {
    return false;
  }

  if (option.route !== null) {
    return true;
  }

  return option.children
    .filter(
      (child) =>
        !isPowerBiMenuOption(child)
    )
    .some(
      hasNavigableDestination
    );
};

export const mapAuthorizedOptionToMenuModulo = (
  option: AuthorizedOption
): MenuModulo => {
  const children = getMenuChildren(
    option
  );

  const hasDestination =
    hasNavigableDestination(
      option
    );

  const isEnabled =
    hasDestination &&
    option.permissions.consultar;

  const badge =
    !hasDestination
      ? UPCOMING_BADGE
      : option.permissions
          .consultar
        ? AVAILABLE_BADGE
        : NO_ACCESS_BADGE;

  return {
    key: String(option.id),
    label: option.name,
    descripcion: buildDescription(
      option
    ),
    icon: option.icon,
    path: option.route ?? undefined,
    children:
      children.length > 0
        ? children
        : undefined,
    isEnabled,
    badge,
  };
};

export const buildMenuModulos = (
  options: readonly AuthorizedOption[]
): MenuModulo[] =>
  options
    .filter(
      (option) =>
        !isPowerBiMenuOption(option)
    )
    .map(
      mapAuthorizedOptionToMenuModulo
    );
