import { useCallback, useState } from 'react';

import type { FichaDeudorGestionPanelParams } from '../../../shared/types/fichaDeudor.types';
import { useGestionesRealizadas } from './useGestionesRealizadas';
import { usePanelGestionRealizadaActions } from './usePanelGestionRealizadaActions';
import { usePanelGestionRealizadaColumns } from './usePanelGestionRealizadaColumns';
import { useRefreshOnKeyChange } from '../../../shared/hooks/useRefreshOnKeyChange';

interface UsePanelGestionRealizadaViewModelParams {
  params: FichaDeudorGestionPanelParams;
  refreshKey?: number;
}

export const usePanelGestionRealizadaViewModel = ({
  params,
  refreshKey = 0,
}: UsePanelGestionRealizadaViewModelParams) => {
  const gestiones = useGestionesRealizadas(params);

  const [vistaExpandida, setVistaExpandida] = useState(false);

  const handleRefreshPanel = useCallback(() => {
    void gestiones.refetch();
    void gestiones.refetchCompleto();
  }, [gestiones]);

  useRefreshOnKeyChange({
    refreshKey,
    onRefresh: handleRefreshPanel,
  });

  const { handleVerMas, handleVolver, handleEliminar } =
    usePanelGestionRealizadaActions({
      setVistaExpandida,
      setResumido: gestiones.setResumido,
    });

  const { columnsResumidas, columnsExpandidas } =
    usePanelGestionRealizadaColumns({
      onEliminar: handleEliminar,
    });

  return {
    ...gestiones,
    vistaExpandida,
    handleVerMas,
    handleVolver,
    columnsResumidas,
    columnsExpandidas,
  };
};