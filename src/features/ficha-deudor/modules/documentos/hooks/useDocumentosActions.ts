import { useCallback, useState } from 'react';

import type { DeudorInfo } from '../../../shared/types';
import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import { executeGestionBoton } from '../registry/gestionBotones.registry';
import type { GestionBoton } from '../types/gestionBoton.types';

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
    (boton: GestionBoton) => {
      const context = { data, params };
      const isImplemented =
        executeGestionBoton(boton.nombre, context) ||
        (boton.label !== boton.nombre &&
          executeGestionBoton(boton.label, context));

      if (!isImplemented) {
        openModal(boton.label);
      }
    },
    [data, openModal, params]
  );

  return {
    modalOpen,
    modalTitle,
    closeModal,
    handleBotonClick,
  };
};
