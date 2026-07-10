import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { FICHA_DEUDOR_ROUTES } from '@features/ficha-deudor/shared/constants/fichaDeudorRoutes.constants';
import { saveFichaDeudorSession } from '@features/ficha-deudor/shared/utils/fichaDeudorSession.utils';

import type { DeudorGestionDeudor } from '../../types/gestionDeudor.types';
import { buildFichaDeudorParams } from '../../utils/gestionDeudorNavigation.utils';
import { AUTH_ROUTES } from '@features/auth/constants';

interface UseGestionDeudorNavigationParams {
  idCliente: string;
  idUsuario: string;
}

export const useGestionDeudorNavigation = ({
  idCliente,
  idUsuario,
}: UseGestionDeudorNavigationParams) => {
  const navigate = useNavigate();

  const goToFichaDeudor = useCallback(
    (row: DeudorGestionDeudor) => {
      const fichaDeudorParams = buildFichaDeudorParams({
        row,
        idCliente,
        idUsuario,
      });

      saveFichaDeudorSession(fichaDeudorParams);

      navigate(FICHA_DEUDOR_ROUTES.FICHA_DEUDOR, {
        state: {
          fichaDeudorParams,
          from: AUTH_ROUTES.GESTION_DEUDOR,
        },
      });
    },
    [idCliente, idUsuario, navigate]
  );

  return {
    goToFichaDeudor,
  };
};