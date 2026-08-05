import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useAccessControl,
} from '@features/access-control';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';

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

const hasNavigableDestination = (
  option: AuthorizedOption
): boolean =>
  option.route !== null ||
  option.children.some(
    hasNavigableDestination
  );

const buildDescription = (
  option: AuthorizedOption
): string =>
  option.description ||
  `Acceso disponible a ${option.name}.`;

const mapAuthorizedOptionToMenuModulo = (
  option: AuthorizedOption
): MenuModulo => {
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
    key: option.code,
    label: option.name,
    descripcion: buildDescription(
      option
    ),
    icon: option.icon,
    path: option.route ?? undefined,
    children:
      option.children.length > 0
        ? option.children.map(
            mapAuthorizedOptionToMenuModulo
          )
        : undefined,
    isEnabled,
    badge,
  };
};

export const useMenuModulos = () => {
  const navigate = useNavigate();

  const {
    usuario,
  } = useAuth();

  const {
    status,
    error,
    menuTree,
    refresh,
  } = useAccessControl();

  const [selectedModulo, setSelectedModulo] =
    useState<MenuModulo | null>(
      null
    );

  const modulos = useMemo(
    () =>
      menuTree.map(
        mapAuthorizedOptionToMenuModulo
      ),
    [menuTree]
  );

  const welcomeName = useMemo(
    () =>
      usuario?.perfil ||
      usuario?.username ||
      'Usuario',
    [usuario]
  );

  const handleSelectModulo = useCallback(
    (modulo: MenuModulo) => {
      if (modulo.children?.length) {
        setSelectedModulo(modulo);
        return;
      }

      if (modulo.path) {
        navigate(modulo.path);
      }
    },
    [navigate]
  );

  const handleSelectChildModulo =
    useCallback(
      (modulo: MenuModulo) => {
        if (!modulo.path) {
          return;
        }

        setSelectedModulo(null);
        navigate(modulo.path);
      },
      [navigate]
    );

  const handleCloseModal =
    useCallback(() => {
      setSelectedModulo(null);
    }, []);

  return {
    modulos,
    selectedModulo,
    welcomeName,
    status,
    error,
    onRetry: refresh,
    onSelectModulo:
      handleSelectModulo,
    onSelectChildModulo:
      handleSelectChildModulo,
    onCloseModal:
      handleCloseModal,
  };
};
