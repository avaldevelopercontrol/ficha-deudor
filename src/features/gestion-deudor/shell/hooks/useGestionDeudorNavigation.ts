import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildFichaDeudorUrl } from '../../utils/gestionDeudorSearchParams.utils';
import type { DeudorGestionDeudor } from '../../types/gestionDeudor.types';

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
      navigate(
        buildFichaDeudorUrl({
          row,
          idCliente,
          idUsuario,
        })
      );
    },
    [idCliente, idUsuario, navigate]
  );

  return {
    goToFichaDeudor,
  };
};
