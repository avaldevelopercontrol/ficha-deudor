import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AUTH_ROUTES,
} from '@features/auth/constants';
import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import {
  useCambiarClaveFormController,
} from '../../cambiar-clave/hooks/useCambiarClaveFormController';

const EXPIRED_PASSWORD_INVALID_CONTEXT =
  'La solicitud para cambiar la clave expirada ya no está disponible. Vuelva al inicio de sesión e intente nuevamente.';

export const useCambiarClaveExpiradaForm = () => {
  const navigate = useNavigate();
  const {
    expiredPasswordChallenge,
    clearExpiredPasswordChallenge,
  } = useAuth();

  const handleSuccess = useCallback(
    (message: string) => {
      clearExpiredPasswordChallenge();
      navigate(AUTH_ROUTES.LOGIN, {
        replace: true,
        state: {
          passwordChangedMessage: message,
        },
      });
    },
    [clearExpiredPasswordChallenge, navigate]
  );

  return useCambiarClaveFormController({
    userId: expiredPasswordChallenge?.userId,
    canEdit: expiredPasswordChallenge !== null,
    invalidSessionMessage: EXPIRED_PASSWORD_INVALID_CONTEXT,
    editPermissionDeniedMessage: EXPIRED_PASSWORD_INVALID_CONTEXT,
    onSuccess: handleSuccess,
  });
};
