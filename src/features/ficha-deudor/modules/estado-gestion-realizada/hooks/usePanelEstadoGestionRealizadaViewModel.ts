import { useCallback, useState } from 'react';

import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';
import { useEstadosGestion } from './useEstadosGestion';
import { usePanelEstadoGestionColumns } from './usePanelEstadoGestionColumns';

interface UsePanelEstadoGestionRealizadaViewModelParams {
  params: FichaDeudorCarteraPanelParams;
}

export const usePanelEstadoGestionRealizadaViewModel = ({
  params,
}: UsePanelEstadoGestionRealizadaViewModelParams) => {
  const estadosGestion = useEstadosGestion(params);

  const [vistaExpandida, setVistaExpandida] = useState(false);

  const handleVerMas = useCallback(() => {
    setVistaExpandida(true);
  }, []);

  const handleVolver = useCallback(() => {
    setVistaExpandida(false);
  }, []);

  const { columnsResumidas, columnsExpandidas } =
    usePanelEstadoGestionColumns();

  return {
    ...estadosGestion,
    vistaExpandida,
    handleVerMas,
    handleVolver,
    columnsResumidas,
    columnsExpandidas,
  };
};