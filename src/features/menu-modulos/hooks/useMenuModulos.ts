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

import {
  MENU_MODULOS_ROUTES,
} from '../constants/menuModulosRoutes.constants';

import type {
  MenuModulo,
} from '../types';

import {
  buildMenuModulos,
} from '../utils/menuModulos.utils';

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
      buildMenuModulos(
        menuTree
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
