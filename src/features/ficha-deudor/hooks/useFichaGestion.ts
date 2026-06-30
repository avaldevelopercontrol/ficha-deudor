import { useCallback } from 'react';
import { useApiResource } from '../../../shared/hooks/useApiResource';
import { fetchGestionEstados, fetchGestionTipos } from '../api/fichaGestionApi';
import type { GestionEstadoList, GestionTipoList } from '../../../shared/types';

export function useGestionEstados(idCliente: string) {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchGestionEstados(idCliente, signal),
    [idCliente]
  );

  return useApiResource<GestionEstadoList[]>(fetcher, []);
}

export function useGestionTipos() {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchGestionTipos(signal),
    []
  );

  return useApiResource<GestionTipoList[]>(fetcher, []);
}