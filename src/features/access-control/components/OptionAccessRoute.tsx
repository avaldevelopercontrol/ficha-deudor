import type React from 'react';

import {
  Navigate,
} from 'react-router-dom';

import {
  AUTH_ROUTES,
} from '@features/auth/constants';

import {
  useAccessControl,
} from '../hooks/useAccessControl';

import {
  AccessControlFeedback,
} from './AccessControlFeedback';

interface OptionAccessRouteProps {
  optionId: number;
  children: React.ReactNode;
}

export const OptionAccessRoute: React.FC<
  OptionAccessRouteProps
> = ({
  optionId,
  children,
}) => {
  const {
    status,
    error,
    hasPermission,
    refresh,
  } = useAccessControl();

  if (
    status === 'idle' ||
    status === 'loading'
  ) {
    return (
      <AccessControlFeedback
        message="Cargando accesos..."
      />
    );
  }

  if (status === 'error') {
    return (
      <AccessControlFeedback
        message={
          error ??
          'No se pudieron cargar sus accesos.'
        }
        actionLabel="Reintentar"
        onAction={() => {
          void refresh();
        }}
      />
    );
  }

  if (
    !hasPermission(
      optionId,
      'consultar'
    )
  ) {
    return (
      <Navigate
        to={
          AUTH_ROUTES
            .MENU_MODULOS
        }
        replace
      />
    );
  }

  return <>{children}</>;
};
