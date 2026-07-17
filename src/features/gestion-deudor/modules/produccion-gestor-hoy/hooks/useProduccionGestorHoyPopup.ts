import {
  useCallback,
} from 'react';

import {
  openFichaDeudorPopup,
} from '@app/popups';

interface UseProduccionGestorHoyPopupParams {
  idCliente: string;
  idUsuario: string;
}

export const useProduccionGestorHoyPopup = ({
  idCliente,
  idUsuario,
}: UseProduccionGestorHoyPopupParams) => {
  const isDisabled =
    !idCliente || !idUsuario;

  const handleOpenProduccionGestorHoy =
    useCallback(() => {
      if (isDisabled) {
        return;
      }

      openFichaDeudorPopup(
        'produccion-gestor-hoy',
        {
          idCliente,
          idUsuario,
        }
      );
    }, [
      idCliente,
      idUsuario,
      isDisabled,
    ]);

  return {
    isDisabled,
    handleOpenProduccionGestorHoy,
  };
};