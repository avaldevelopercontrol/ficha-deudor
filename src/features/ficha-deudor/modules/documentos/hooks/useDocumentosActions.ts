import { useCallback, useState } from 'react';

import type {
  BotonApi,
  DeudorInfo,
} from '../../../shared/types';
import type {
  FichaDeudorDocumentosParams,
} from '../../../shared/types/fichaDeudor.types';
import {
  openFichaDeudorPopup,
} from '@app/popups';

interface UseDocumentosActionsParams {
  data: DeudorInfo;
  params: FichaDeudorDocumentosParams;
}

export const useDocumentosActions = ({
  data,
  params,
}: UseDocumentosActionsParams) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const openModal = useCallback((title: string) => {
    setModalTitle(title);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleBotonClick = useCallback(
    (boton: BotonApi) => {
      const {
        id_cliente: idCliente,
        id_cartera: idCartera,
        id_deudor: idDeudor,
        id_usuario: idUsuario,
      } = params;

      const nombre = data.nombreRazonSocial;
      const documento = data.dniRuc;

      switch (boton.action) {
        case 'popup_estado_cuenta':
        openFichaDeudorPopup('estado-cuenta', {
          idCliente,
          idCartera,
          idDeudor,
          nombre,
          documento,
        });
        return;
        case 'popup_pago':
          openFichaDeudorPopup('pago-deudor', {
            idCliente,
            idCartera,
            idDeudor,
            nombre,
            documento,
          });
          return;

        case 'popup_email':
          openFichaDeudorPopup('email-deudor', {
            idCliente,
            idDeudor,
            idUsuario,
            nombre,
            documento,
          });
          return;

        case 'popup_agenda':
          openFichaDeudorPopup('agenda-deudor', {
            idCliente,
            idCartera,
            idDeudor,
            idUsuario,
            nombre,
            documento,
          });
          return;

        case 'popup_inf_deudor':
          openFichaDeudorPopup('inf-deudor', {
            idCliente,
            idCartera,
            idDeudor,
            idUsuario,
            nombre,
            documento,
          });
          return;

        default:
          openModal(boton.label);
      }
    },
    [
      data.dniRuc,
      data.nombreRazonSocial,
      openModal,
      params,
    ]
  );

  return {
    modalOpen,
    modalTitle,
    closeModal,
    handleBotonClick,
  };
};