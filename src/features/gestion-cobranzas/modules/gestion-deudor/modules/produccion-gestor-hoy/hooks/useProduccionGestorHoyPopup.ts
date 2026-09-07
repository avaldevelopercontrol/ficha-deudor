import {
  useCallback,
} from 'react';

import {
  openFichaDeudorPopup,
} from '@app/popups';

import type {
  GestionDeudorIdentity,
} from '../../../utils/gestionDeudorIdentity.utils';

interface UseProduccionGestorHoyPopupParams {
  identity: GestionDeudorIdentity | null;
}

export const useProduccionGestorHoyPopup = ({
  identity,
}: UseProduccionGestorHoyPopupParams) => {
  const isDisabled = !identity;

  const handleOpenProduccionGestorHoy =
    useCallback(() => {
      if (!identity) {
        return;
      }

      openFichaDeudorPopup(
        'produccion-gestor-hoy',
        identity
      );
    }, [identity]);

  return {
    isDisabled,
    handleOpenProduccionGestorHoy,
  };
};
