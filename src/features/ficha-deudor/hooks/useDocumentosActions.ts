import { useCallback, useState } from 'react';

import type { BotonApi, DeudorInfo } from '../../../shared/types/indexApi';
import {
  DOCUMENTOS_POPUP_HEIGHT,
  DOCUMENTOS_POPUP_WIDTH,
} from '../constants/documentosTable.constants';
import { openPopup } from '../utils/popup.utils';

interface UseDocumentosActionsParams {
  data: DeudorInfo;
}

export const useDocumentosActions = ({ data }: UseDocumentosActionsParams) => {
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
      if (boton.popupUrl) {
        const nombre = encodeURIComponent(data.nombreRazonSocial);
        const documento = encodeURIComponent(data.dniRuc);
        const url = `${boton.popupUrl}?nombre=${nombre}&documento=${documento}`;

        openPopup(
          url,
          boton.label,
          DOCUMENTOS_POPUP_WIDTH,
          DOCUMENTOS_POPUP_HEIGHT
        );
        return;
      }

      openModal(boton.label);
    },
    [data.dniRuc, data.nombreRazonSocial, openModal]
  );

  return {
    modalOpen,
    modalTitle,
    closeModal,
    handleBotonClick,
  };
};