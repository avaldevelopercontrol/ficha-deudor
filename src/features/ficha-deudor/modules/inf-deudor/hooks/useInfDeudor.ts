import { useEffect, useCallback, useRef, useReducer } from 'react';

import {
  fetchInfDeudorCabeceraFalse,
  fetchInfDeudorCabeceraTrue,
  fetchInfDeudorParams,
} from '../api/infDeudorApi';
import type { InfDeudorTableRow } from '../types/infDeudor.types';
import { INF_DEUDOR_POPUP_MESSAGES } from '../constants/infDeudorPopup.constants';
import { mapInfDeudorApiToTableRows } from '../mappers/infDeudor.mapper';

interface UseInfDeudorReturn {
  rows: InfDeudorTableRow[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface InfDeudorState {
  rows: InfDeudorTableRow[];
  isLoading: boolean;
  error: string | null;
}

type InfDeudorAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; rows: InfDeudorTableRow[] }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: InfDeudorState = {
  rows: [],
  isLoading: false,
  error: null,
};

function infDeudorReducer(
  state: InfDeudorState,
  action: InfDeudorAction
): InfDeudorState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOAD_SUCCESS':
      return {
        rows: action.rows,
        isLoading: false,
        error: null,
      };

    case 'LOAD_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };

    default:
      return state;
  }
}

export function useInfDeudor(id_deudor: string): UseInfDeudorReturn {
  const [state, dispatch] = useReducer(infDeudorReducer, initialState);
  const { rows, isLoading, error } = state;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(
    async (signal: AbortSignal) => {
      dispatch({
        type: 'LOAD_START',
      });

      try {
        const [cabeceraPrincipal, cabeceraAdicional, valoresDeudor] =
          await Promise.all([
            fetchInfDeudorCabeceraFalse(signal),
            fetchInfDeudorCabeceraTrue(signal),
            fetchInfDeudorParams(id_deudor, signal),
          ]);

        if (signal.aborted || !isMountedRef.current) return;

        dispatch({
          type: 'LOAD_SUCCESS',
          rows: mapInfDeudorApiToTableRows(
            cabeceraPrincipal,
            cabeceraAdicional,
            valoresDeudor
          ),
        });
      } catch (err) {
        if (!signal.aborted && isMountedRef.current) {
          dispatch({
            type: 'LOAD_ERROR',
            error:
              err instanceof Error
                ? err.message
                : INF_DEUDOR_POPUP_MESSAGES.loadError,
          });
        }
      }
    },
    [id_deudor]
  );

  useEffect(() => {
    if (!id_deudor) return;

    const controller = new AbortController();

    void loadData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [id_deudor, loadData]);

  const refetch = useCallback(() => {
    if (!id_deudor) return;

    const controller = new AbortController();

    void loadData(controller.signal);
  }, [id_deudor, loadData]);

  return {
    rows,
    isLoading,
    error,
    refetch,
  };
}