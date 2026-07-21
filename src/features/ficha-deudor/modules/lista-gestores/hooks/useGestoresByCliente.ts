import {
  useCallback,
  useMemo,
} from 'react';

import { fetchGestoresByCliente } from '../api/gestoresApi';

import type { Gestor } from '../types/gestor.types';

import {
  usePopupTableResource,
  type SelectedFilters,
  type TextFilters,
} from '../../../shared/hooks/popups/usePopupTableResource';

export type {
  TextFilters,
  SelectedFilters,
};

const GESTORES_MISSING_PARAMS_ERROR =
  'Falta el parámetro id_cliente';

const GESTORES_LOAD_ERROR =
  'Error cargando gestores';

const GESTORES_INITIAL_PAGE_SIZE = 10;

export function useGestoresByCliente(
  idCliente: string
) {
  const resetDeps = useMemo(
    () => [idCliente] as const,
    [idCliente]
  );

  const fetcher = useCallback(
    (signal?: AbortSignal) =>
      fetchGestoresByCliente(
        idCliente,
        signal
      ),
    [idCliente]
  );

  return usePopupTableResource<Gestor>({
    areParamsReady: Boolean(idCliente),

    missingParamsError:
      GESTORES_MISSING_PARAMS_ERROR,

    loadError:
      GESTORES_LOAD_ERROR,

    resetDeps,
    fetcher,

    initialPageSize:
      GESTORES_INITIAL_PAGE_SIZE,
  });
}