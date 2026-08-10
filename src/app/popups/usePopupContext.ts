import { useEffect, useMemo, useState } from 'react';

import {
  isFichaDeudorPopupContext,
  type FichaDeudorPopupContext,
  type FichaDeudorPopupType,
} from './popupContext.types';

import {
  isPopupContextResponseMessage,
  parsePopupWindowName,
  requestPopupContext,
} from './popupMessaging.utils';
import {
  loadPopupContextFromStorage,
  savePopupContextToStorage,
} from './popupContextStorage.utils';

interface UsePopupContextResult<
  T extends FichaDeudorPopupType,
> {
  context: FichaDeudorPopupContext<T> | null;
  isLoading: boolean;
  error: string | null;
}

export const usePopupContext = <
  T extends FichaDeudorPopupType,
>(
  popupType: T
): UsePopupContextResult<T> => {
  const popupDescriptor = useMemo(
    () => parsePopupWindowName(window.name),
    []
  );

  const popupId =
    popupDescriptor?.popupType === popupType
      ? popupDescriptor.popupId
      : null;

  const [context, setContext] =
    useState<FichaDeudorPopupContext<T> | null>(() => {
      if (!popupId) {
        return null;
      }

      try {
        return loadPopupContextFromStorage(
          sessionStorage,
          popupType,
          popupId
        );
      } catch {
        return null;
      }
    });

  const [error, setError] = useState<string | null>(
    !popupDescriptor
      ? 'No se pudo identificar el contexto del popup.'
      : popupDescriptor.popupType !== popupType
        ? 'El contexto no corresponde al tipo de popup solicitado.'
        : null
  );

  useEffect(() => {
    if (context || !popupId) {
      return;
    }

    /*
     * Si el popup no tiene un contexto almacenado y tampoco
     * existe la ventana que lo abrió, no podrá solicitar datos.
     *
     * No usamos setError aquí para evitar actualizar estado
     * directamente dentro del efecto.
     */
    const openerWindow = window.opener;

    if (!openerWindow) {
      return;
    }

    const handleContextResponse = (
      event: MessageEvent<unknown>
    ): void => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.source !== openerWindow) {
        return;
      }

      if (!isPopupContextResponseMessage(event.data)) {
        return;
      }

      if (
        event.data.popupId !== popupId ||
        event.data.popupType !== popupType ||
        !isFichaDeudorPopupContext(
          popupType,
          event.data.context
        )
      ) {
        return;
      }

      const receivedContext = event.data.context;

      try {
        savePopupContextToStorage(
          sessionStorage,
          popupType,
          popupId,
          receivedContext
        );
      } catch {
        /*
         * El popup seguirá funcionando con el estado en memoria,
         * pero perderá el contexto si se actualiza la ventana.
         */
      }

      setContext(receivedContext);
      setError(null);
    };

    window.addEventListener(
      'message',
      handleContextResponse
    );

    requestPopupContext(popupType, popupId);

    return () => {
      window.removeEventListener(
        'message',
        handleContextResponse
      );
    };
  }, [
    context,
    popupId,
    popupType,
  ]);

  const resolvedError =
    error ??
    (!context && popupId && !window.opener
      ? 'No se encontró la ventana que abrió el popup.'
      : null);

  return {
    context,
    isLoading: !context && !resolvedError,
    error: resolvedError,
  };
};
