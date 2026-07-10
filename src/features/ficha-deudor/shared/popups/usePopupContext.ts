import { useEffect, useMemo, useState } from 'react';

import type {
  FichaDeudorPopupContext,
  FichaDeudorPopupType,
} from './popupContext.types';

import {
  getPopupIdFromWindowName,
  isPopupContextResponseMessage,
  requestPopupContext,
} from './popupMessaging.utils';

interface UsePopupContextResult<
  T extends FichaDeudorPopupType,
> {
  context: FichaDeudorPopupContext<T> | null;
  isLoading: boolean;
  error: string | null;
}

const getStorageKey = (
  popupType: FichaDeudorPopupType,
  popupId: string
): string => {
  return `avalperu_popup_context:${popupType}:${popupId}`;
};

export const usePopupContext = <
  T extends FichaDeudorPopupType,
>(
  popupType: T
): UsePopupContextResult<T> => {
  const popupId = useMemo(
    () => getPopupIdFromWindowName(window.name),
    []
  );

  const storageKey = popupId
    ? getStorageKey(popupType, popupId)
    : null;

  const [context, setContext] =
    useState<FichaDeudorPopupContext<T> | null>(() => {
      if (!storageKey) {
        return null;
      }

      try {
        const storedContext =
          sessionStorage.getItem(storageKey);

        return storedContext
          ? (JSON.parse(
              storedContext
            ) as FichaDeudorPopupContext<T>)
          : null;
      } catch {
        return null;
      }
    });

  const [error, setError] = useState<string | null>(
    popupId
      ? null
      : 'No se pudo identificar el contexto del popup.'
  );

  useEffect(() => {
    if (context || !popupId || !storageKey) {
      return;
    }

    /*
     * Si el popup no tiene un contexto almacenado y tampoco
     * existe la ventana que lo abrió, no podrá solicitar datos.
     *
     * No usamos setError aquí para evitar actualizar estado
     * directamente dentro del efecto.
     */
    if (!window.opener) {
      return;
    }

    const handleContextResponse = (
      event: MessageEvent<unknown>
    ): void => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.source !== window.opener) {
        return;
      }

      if (!isPopupContextResponseMessage(event.data)) {
        return;
      }

      if (
        event.data.popupId !== popupId ||
        event.data.popupType !== popupType
      ) {
        return;
      }

      const receivedContext =
        event.data.context as FichaDeudorPopupContext<T>;

      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify(receivedContext)
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

    requestPopupContext(popupId);

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
    storageKey,
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