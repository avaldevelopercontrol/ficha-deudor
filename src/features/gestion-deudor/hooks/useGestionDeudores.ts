import { useCallback, useState } from 'react';
import { useClientSideTable } from '@shared/hooks/useClientSideTable';
import { fetchDeudoresGestionDeudor } from '../api/deudoresGestionDeudorApi';
import { GESTION_DEUDOR_API_DEFAULTS } from '../constants/gestionDeudorApi.constants';
import { validateGestionDeudorSearch } from '../validations/validations';
import type {
  DeudorGestionDeudor,
  TipoBusquedaGestionDeudor,
} from '../types/gestionDeudor.types';

export function useGestionDeudores(idCliente?: string | null) {
  const [tipoBusqueda, setTipoBusqueda] =
    useState<TipoBusquedaGestionDeudor>('R');

  const [valorBusqueda, setValorBusqueda] = useState('');
  const [allData, setAllData] = useState<DeudorGestionDeudor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const table = useClientSideTable<DeudorGestionDeudor>(allData, [idCliente], {
    initialPageSize: 10,
  });

  const buscar = useCallback(async () => {
    const validation = validateGestionDeudorSearch({
      idCliente,
      tipoBusqueda,
      valorBusqueda,
    });

    if (!validation.isValid) {
      setError(validation.message || 'Datos de búsqueda inválidos.');
      setAllData([]);
      table.resetFilters();
      return;
    }

    setIsLoading(true);
    setError(null);
    table.resetFilters();

    try {
      const result = await fetchDeudoresGestionDeudor({
        nIdCliente: String(idCliente),
        busqueda: validation.busqueda,
        pageNumber: GESTION_DEUDOR_API_DEFAULTS.pageNumber,
        pageSize: GESTION_DEUDOR_API_DEFAULTS.pageSize,
      });

      setAllData(result);
    } catch (err) {
      setAllData([]);
      setError(
        err instanceof Error ? err.message : 'Error al buscar deudores.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [idCliente, tipoBusqueda, valorBusqueda, table]);

  const limpiar = useCallback(() => {
    setValorBusqueda('');
    setAllData([]);
    setError(null);
    table.resetFilters();
  }, [table]);

  return {
    tipoBusqueda,
    valorBusqueda,
    setTipoBusqueda,
    setValorBusqueda,

    allData,
    isLoading,
    error,

    buscar,
    limpiar,

    ...table,
  };
}
