import {
  useCallback,
  useState,
} from 'react';

import type { FichaDeudorGestionPanelParams } from '../../../shared/types/fichaDeudor.types';

import { useGestionesRealizadas } from './useGestionesRealizadas';

import { usePanelGestionRealizadaActions } from './usePanelGestionRealizadaActions';

import { usePanelGestionRealizadaColumns } from './usePanelGestionRealizadaColumns';

import { useRefreshOnKeyChange } from '../../../shared/hooks/useRefreshOnKeyChange';

interface UsePanelGestionRealizadaViewModelParams {
  params: FichaDeudorGestionPanelParams;
  refreshKey?: number;
}

export const usePanelGestionRealizadaViewModel =
  ({
    params,
    refreshKey = 0,
  }: UsePanelGestionRealizadaViewModelParams) => {
    const [
      vistaExpandida,
      setVistaExpandida,
    ] = useState(false);

    const [
      historicoInicializado,
      setHistoricoInicializado,
    ] = useState(false);

    const gestiones =
      useGestionesRealizadas(params, {
        loadHistoricas:
          historicoInicializado,
      });

    const {
      refetch,
      refetchCompleto,
    } = gestiones;

    const handleRefreshPanel =
      useCallback(() => {
        void refetch();

        if (historicoInicializado) {
          void refetchCompleto();
        }
      }, [
        refetch,
        refetchCompleto,
        historicoInicializado,
      ]);

    useRefreshOnKeyChange({
      refreshKey,
      onRefresh: handleRefreshPanel,
    });

    const {
      handleVerMas: handleVerMasBase,
      handleVolver,
    } =
      usePanelGestionRealizadaActions({
        setVistaExpandida,
        setResumido:
          gestiones.setResumido,
      });

    const handleVerMas =
      useCallback(() => {
        setHistoricoInicializado(true);
        handleVerMasBase();
      }, [handleVerMasBase]);

    const {
      columnsResumidas,
      columnsExpandidas,
    } =
      usePanelGestionRealizadaColumns();

    return {
      ...gestiones,
      vistaExpandida,
      handleVerMas,
      handleVolver,
      columnsResumidas,
      columnsExpandidas,
    };
  };