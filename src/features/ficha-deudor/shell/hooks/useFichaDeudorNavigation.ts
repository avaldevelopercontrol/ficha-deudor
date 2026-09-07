import { useCallback } from 'react';
import {
  useLocation,
  useNavigate,
  type NavigateFunction,
} from 'react-router-dom';

import { GESTION_COBRANZAS_ROUTES } from '@features/gestion-cobranzas/constants/gestionCobranzasRoutes.constants';

import { clearFichaDeudorSession } from '../../shared/utils/fichaDeudorSession.utils';

export const getFichaDeudorReturnPath = (
  state: unknown
): string | null => {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const from = (state as { from?: unknown }).from;

  return typeof from === 'string' ? from : null;
};

export const exitFichaDeudor = (
  navigate: NavigateFunction,
  returnPath: string | null
): void => {
  clearFichaDeudorSession();

  if (returnPath === GESTION_COBRANZAS_ROUTES.GESTION_DEUDOR) {
    navigate(-1);
    return;
  }

  navigate(GESTION_COBRANZAS_ROUTES.GESTION_DEUDOR, {
    replace: true,
  });
};

export const useFichaDeudorNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = getFichaDeudorReturnPath(location.state);

  const goToGestionDeudor = useCallback(() => {
    exitFichaDeudor(navigate, returnPath);
  }, [navigate, returnPath]);

  const handleGestionGuardada = useCallback(
    (gestionTerminada: boolean) => {
      if (gestionTerminada) {
        goToGestionDeudor();
      }
    },
    [goToGestionDeudor]
  );

  return {
    handleCancelar: goToGestionDeudor,
    handleGestionGuardada,
  };
};
