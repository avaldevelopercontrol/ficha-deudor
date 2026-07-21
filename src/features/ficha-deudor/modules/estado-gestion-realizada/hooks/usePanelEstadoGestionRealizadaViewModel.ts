import {
  useCallback,
  useState,
} from 'react';

import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';

import { useEstadosGestion } from './useEstadosGestion';

import { usePanelEstadoGestionColumns } from './usePanelEstadoGestionColumns';

interface UsePanelEstadoGestionRealizadaViewModelParams {
  params: FichaDeudorCarteraPanelParams;
}

export const usePanelEstadoGestionRealizadaViewModel =
  ({
    params,
  }: UsePanelEstadoGestionRealizadaViewModelParams) => {
    const [
      vistaExpandida,
      setVistaExpandida,
    ] = useState(false);

    const [
      historicoInicializado,
      setHistoricoInicializado,
    ] = useState(false);

    const estadosGestion =
      useEstadosGestion(params, {
        loadHistoricos:
          historicoInicializado,
      });

    const handleVerMas =
      useCallback(() => {
        setHistoricoInicializado(true);
        setVistaExpandida(true);
      }, []);

    const handleVolver =
      useCallback(() => {
        setVistaExpandida(false);
      }, []);

    const {
      columnsResumidas,
      columnsExpandidas,
    } =
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