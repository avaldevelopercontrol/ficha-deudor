import {
  useCallback,
  useMemo,
} from 'react';

import {
  openFichaDeudorPopup,
} from '@app/popups';

import {
  resolveProduccionGestorHoyIdentity,
} from '../utils/produccionGestorHoyIdentity.utils';

interface UseProduccionGestorHoyPopupParams {
  idCliente: string;
  idUsuario: string;
}

export const useProduccionGestorHoyPopup = ({
  idCliente,
  idUsuario,
}: UseProduccionGestorHoyPopupParams) => {
  const identity = useMemo(
    () =>
      resolveProduccionGestorHoyIdentity(
        idCliente,
        idUsuario
      ),
    [idCliente, idUsuario]
  );
  const isDisabled = !identity;

  const handleOpenProduccionGestorHoy =
    useCallback(() => {
      if (isDisabled) {
        return;
      }

      openFichaDeudorPopup(
        'produccion-gestor-hoy',
        identity
      );
    }, [
      identity,
      isDisabled,
    ]);

  return {
    isDisabled,
    handleOpenProduccionGestorHoy,
  };
};