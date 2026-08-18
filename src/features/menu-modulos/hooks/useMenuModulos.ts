import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  APPLICATION_OPTION_IDS,
  getOptionRoute,
  useAccessControl,
} from '@features/access-control';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import type {
  AuthorizedOption,
} from '@features/access-control';

import {
  MENU_MODULOS_ROUTES,
} from '../constants/menuModulosRoutes.constants';

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
    key: String(option.id),
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
  const location = useLocation();
  const navigate = useNavigate();

  const {
    usuario,
    passwordExpiryWarning,
    clearPasswordExpiryWarning,
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

  useEffect(() => {
    if (!location.search) {
      return;
    }

    navigate(
      MENU_MODULOS_ROUTES.MENU_MODULOS,
      { replace: true }
    );
  }, [location.search, navigate]);

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
        if (modulo.children?.length) {
          setSelectedModulo(modulo);
          return;
        }

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

  const handleDismissPasswordExpiryWarning = useCallback(() => {
    clearPasswordExpiryWarning();
  }, [clearPasswordExpiryWarning]);

  const handleChangePasswordNow = useCallback(() => {
    const changePasswordRoute = getOptionRoute(
      APPLICATION_OPTION_IDS
        .CAMBIAR_CLAVE
    );

    if (!changePasswordRoute) {
      return;
    }

    clearPasswordExpiryWarning();
    navigate(changePasswordRoute);
  }, [clearPasswordExpiryWarning, navigate]);

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
    passwordExpiryWarningModalProps: {
      isOpen: passwordExpiryWarning !== null,
      message: passwordExpiryWarning?.message ?? '',
      title: 'Clave próxima a expirar',
      heading: 'Actualice su clave antes del bloqueo',
      actionLabel: 'Cambiar ahora',
      dismissLabel: 'Más tarde',
      onClose: handleDismissPasswordExpiryWarning,
      onDismiss: handleDismissPasswordExpiryWarning,
      onChangePassword: handleChangePasswordNow,
    },
  };
};
