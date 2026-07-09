import { useCallback, type Dispatch, type SetStateAction } from 'react';

import type { GestionRealizada } from '../../../shared/types';
import type { UseGestionesRealizadasReturn } from './useGestionesRealizadas';
import { buildEliminarGestionConfirmMessage } from '../constants/panelGestionRealizada.constants';

interface UsePanelGestionRealizadaActionsParams {
  setVistaExpandida: Dispatch<SetStateAction<boolean>>;
  setResumido: UseGestionesRealizadasReturn['setResumido'];
}

export const usePanelGestionRealizadaActions = ({
  setVistaExpandida,
  setResumido,
}: UsePanelGestionRealizadaActionsParams) => {
  const handleVerMas = useCallback(() => {
    setVistaExpandida(true);
  }, [setVistaExpandida]);

  const handleVolver = useCallback(() => {
    setVistaExpandida(false);
  }, [setVistaExpandida]);

  const handleEliminar = useCallback(
    (row: GestionRealizada) => {
      const shouldDelete = window.confirm(
        buildEliminarGestionConfirmMessage(row.nro)
      );

      if (!shouldDelete) return;

      setResumido((prev) =>
        prev.filter((gestion) => gestion.id !== row.id)
      );
    },
    [setResumido]
  );

  return {
    handleVerMas,
    handleVolver,
    handleEliminar,
  };
};