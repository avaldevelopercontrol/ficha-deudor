import { useCallback, useEffect } from 'react';

import type { SetGestionField } from '../types/fichaGestion.types';
import {
  buildFichaDeudorPopupPath,
  FICHA_DEUDOR_POPUP_WINDOW_FEATURES,
  FICHA_DEUDOR_POPUP_WINDOW_NAMES,
} from '../../../shared/constants/fichaDeudorRoutes.constants';
import { openPopupWindow } from '../../../shared/utils/popup.utils';

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
  if (typeof data !== 'object' || data === null) return false;

  return (data as { type?: unknown }).type === 'GESTOR_SELECTED';
};

export const useGestorSelectorPopup = ({
  idCliente,
  setField,
}: UseGestorSelectorPopupParams) => {
  const handleOpenListaGestores = useCallback(() => {
    if (!idCliente) return;

    openPopupWindow({
      path: buildFichaDeudorPopupPath.listaGestores(idCliente),
      name: FICHA_DEUDOR_POPUP_WINDOW_NAMES.LISTA_GESTORES,
      features: FICHA_DEUDOR_POPUP_WINDOW_FEATURES.LARGE,
    });
  }, [idCliente]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin) return;
      if (!isGestorSelectedMessage(event.data)) return;

      const { id, nombre } = event.data.payload ?? {};

      if (id === undefined || nombre === undefined) return;

      setField('gestorId', String(id));
      setField('gestorNombre', nombre);
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [setField]);

  return {
    handleOpenListaGestores,
  };
};