import { useCallback, useEffect } from 'react';

import {
  openFichaDeudorPopup,
} from '../../../shared/popups/popupMessaging.utils';
import type {
  SetGestionField,
} from '../types/fichaGestion.types';

interface UseGestorSelectorPopupParams {
  idCliente: string;
  setField: SetGestionField;
}

type GestorSelectedMessage = {
  type: 'GESTOR_SELECTED';
  payload?: {
    id?: string | number;
    nombre?: string;
  };
};

const isGestorSelectedMessage = (
  data: unknown
): data is GestorSelectedMessage => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  return (
    (data as { type?: unknown }).type ===
    'GESTOR_SELECTED'
  );
};

export const useGestorSelectorPopup = ({
  idCliente,
  setField,
}: UseGestorSelectorPopupParams) => {
  const handleOpenListaGestores = useCallback(() => {
    if (!idCliente) {
      return;
    }

    openFichaDeudorPopup('lista-gestores', {
      idCliente,
    });
  }, [idCliente]);

  useEffect(() => {
    const handleMessage = (
      event: MessageEvent<unknown>
    ): void => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (!isGestorSelectedMessage(event.data)) {
        return;
      }

      const { id, nombre } =
        event.data.payload ?? {};

      if (
        id === undefined ||
        nombre === undefined
      ) {
        return;
      }

      setField('gestorId', String(id));
      setField('gestorNombre', nombre);
    };

    window.addEventListener(
      'message',
      handleMessage
    );

    return () => {
      window.removeEventListener(
        'message',
        handleMessage
      );
    };
  }, [setField]);

  return {
    handleOpenListaGestores,
  };
};