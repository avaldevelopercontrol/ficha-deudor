import {
  useCallback,
} from 'react';

import {
  useClientSideTable,
} from '@shared/hooks/useClientSideTable';

import {
  useGestionDeudorSearch,
} from '../modules/busqueda/hooks/useGestionDeudorSearch';
import type {
  DeudorGestionDeudor,
} from '../types/gestionDeudor.types';

export function useGestionDeudores(
  idCliente?: string | null
) {
  const search =
    useGestionDeudorSearch(idCliente);
  const {
    data,
    tipoBusqueda,
    valorBusqueda,
    setTipoBusqueda,
    setValorBusqueda,
    isLoading,
    error,
    buscar: executeSearch,
    limpiar: clearSearch,
  } = search;
  const table =
    useClientSideTable<DeudorGestionDeudor>(
      data,
      [idCliente],
      {
        initialPageSize: 10,
      }
    );

  const { resetFilters } = table;

  const buscar = useCallback(() => {
    resetFilters();
    executeSearch();
  }, [executeSearch, resetFilters]);

  const limpiar = useCallback(() => {
    clearSearch();
    resetFilters();
  }, [clearSearch, resetFilters]);

  return {
    tipoBusqueda,
    valorBusqueda,
    setTipoBusqueda,
    setValorBusqueda,

    allData: data,
    isLoading,
    error,

    buscar,
    limpiar,

    ...table,
  };
}
