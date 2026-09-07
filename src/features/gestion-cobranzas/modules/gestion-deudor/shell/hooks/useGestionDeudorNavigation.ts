import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { GESTION_COBRANZAS_ROUTES } from '@features/gestion-cobranzas/constants/gestionCobranzasRoutes.constants';
import { FICHA_DEUDOR_ROUTES } from '@features/ficha-deudor/shared/constants/fichaDeudorRoutes.constants';
import { saveFichaDeudorSession } from '@features/ficha-deudor/shared/utils/fichaDeudorSession.utils';

import type { DeudorGestionDeudor } from '../../types/gestionDeudor.types';
import type { GestionDeudorIdentity } from '../../utils/gestionDeudorIdentity.utils';
import { resolveFichaDeudorParams } from '../../utils/gestionDeudorNavigation.utils';

interface UseGestionDeudorNavigationParams {
  identity: GestionDeudorIdentity | null;
}

export const useGestionDeudorNavigation = ({
  identity,
}: UseGestionDeudorNavigationParams) => {
  const navigate = useNavigate();
  const isDisabled = !identity;

  const goToFichaDeudor = useCallback(
    (row: DeudorGestionDeudor) => {
      if (!identity) {
        return;
      }

      const fichaDeudorParams =
        resolveFichaDeudorParams({
          row,
          identity,
        });

      if (!fichaDeudorParams) {
        return;
      }

      saveFichaDeudorSession(fichaDeudorParams);

      navigate(FICHA_DEUDOR_ROUTES.FICHA_DEUDOR, {
        state: {
          fichaDeudorParams,
          from: GESTION_COBRANZAS_ROUTES.GESTION_DEUDOR,
        },
      });
    },
    [identity, navigate]
  );

  return {
    goToFichaDeudor,
    isDisabled,
  };
};
