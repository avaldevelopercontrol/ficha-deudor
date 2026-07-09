import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { fetchGestoresByCliente } from '../api/gestoresApi';
import type { Gestor } from '../types/gestor.types';
import {
  useClientSideTable,
  type SelectedFilters,
  type TextFilters,
} from '@shared/hooks/useClientSideTable';

export type { TextFilters, SelectedFilters };

interface GestoresState {
  allData: Gestor[];
  isLoading: boolean;
  error: string | null;
}

type GestoresAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; data: Gestor[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'RESET_WITH_ERROR'; error: string };

const initialState: GestoresState = {
  allData: [],
  isLoading: false,
  error: null,
};

function gestoresReducer(
  state: GestoresState,
  action: GestoresAction
): GestoresState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOAD_SUCCESS':
      return {
        allData: action.data,
        isLoading: false,
        error: null,
      };

    case 'LOAD_ERROR':
    case 'RESET_WITH_ERROR':
      return {
        allData: [],
        isLoading: false,
        error: action.error,
      };

    default:
      return state;
  }
}

export function useGestoresByCliente(idCliente: string) {
  const [state, dispatch] = useReducer(gestoresReducer, initialState);
  const { allData, isLoading, error } = state;

  const resetDeps = useMemo(() => [idCliente] as const, [idCliente]);

  const table = useClientSideTable(allData, resetDeps, {
    initialPageSize: 10,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!idCliente) {
      dispatch({
        type: 'RESET_WITH_ERROR',
        error: 'Falta el parámetro id_cliente',
      });
      return;
    }

    const controller = new AbortController();

    const loadData = async () => {
      dispatch({ type: 'LOAD_START' });

      try {
        const result = await fetchGestoresByCliente(
          idCliente,
          controller.signal
        );

        if (controller.signal.aborted) return;

        dispatch({
          type: 'LOAD_SUCCESS',
          data: result,
        });
      } catch (err) {
        if (!controller.signal.aborted) {
          dispatch({
            type: 'LOAD_ERROR',
            error:
              err instanceof Error
                ? err.message
                : 'Error cargando gestores',
          });
        }
      }
    };

    void loadData();

    return () => {
      controller.abort();
    };
  }, [idCliente]);

  const refetch = useCallback(() => {
    if (!idCliente) return;

    dispatch({ type: 'LOAD_START' });

    fetchGestoresByCliente(idCliente)
      .then((result) => {
        if (!isMountedRef.current) return;

        dispatch({
          type: 'LOAD_SUCCESS',
          data: result,
        });
      })
      .catch((err) => {
        if (!isMountedRef.current) return;

        dispatch({
          type: 'LOAD_ERROR',
          error:
            err instanceof Error
              ? err.message
              : 'Error cargando gestores',
        });
      });
  }, [idCliente]);

  return {
    allData,
    filteredData: table.filteredData,
    paginatedData: table.paginatedData,
    isLoading,
    error,
    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords: table.totalRecords,
    totalPages: table.totalPages,
    setPageNumber: table.setPageNumber,
    setPageSize: table.setPageSize,
    refetch,
    textFilters: table.textFilters,
    selectedFilters: table.selectedFilters,
    onTextFilterChange: table.onTextFilterChange,
    onSelectedFilterChange: table.onSelectedFilterChange,
    resetFilters: table.resetFilters,
  };
}