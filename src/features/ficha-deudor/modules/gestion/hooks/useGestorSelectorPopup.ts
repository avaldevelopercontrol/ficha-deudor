import {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  openFichaDeudorPopup,
  parsePopupWindowName,
} from '@app/popups';
import {
  isGestorSeleccionadoMessage,
} from '../../lista-gestores/utils/gestorMessaging.utils';
import type {
  SetGestionField,
} from '../types/fichaGestion.types';

interface UseGestorSelectorPopupParams {
  idCliente: string;
  setField: SetGestionField;
}

interface GestorPopupReference {
  popupWindow: Window;
  popupId: string;
}

export const useGestorSelectorPopup = ({
  idCliente,
  setField,
}: UseGestorSelectorPopupParams) => {
  const popupReferenceRef =
    useRef<GestorPopupReference | null>(null);

  const handleOpenListaGestores = useCallback(() => {
    if (!idCliente) {
      return;
    }

    const popupWindow = openFichaDeudorPopup(
      'lista-gestores',
      {
        idCliente,
      }
    );

    if (!popupWindow) {
      popupReferenceRef.current = null;
      return;
    }

    const popupDescriptor =
      parsePopupWindowName(popupWindow.name);

    if (
      !popupDescriptor ||
      popupDescriptor.popupType !== 'lista-gestores'
    ) {
      popupReferenceRef.current = null;
      return;
    }

    popupReferenceRef.current = {
      popupWindow,
      popupId: popupDescriptor.popupId,
    };
  }, [idCliente]);

  useEffect(() => {
    const handleMessage = (
      event: MessageEvent<unknown>
    ): void => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const popupReference =
        popupReferenceRef.current;

      if (
        !popupReference ||
        event.source !== popupReference.popupWindow
      ) {
        return;
      }

      if (
        !isGestorSeleccionadoMessage(
          event.data,
          popupReference.popupId
        )
      ) {
        return;
      }

      setField('gestorId', event.data.payload.id);
      setField(
        'gestorNombre',
        event.data.payload.nombre
      );

      popupReferenceRef.current = null;
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

      popupReferenceRef.current = null;
    };
  }, [setField]);

  return {
    handleOpenListaGestores,
  };
};
