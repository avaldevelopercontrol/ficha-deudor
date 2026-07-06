import { useCallback, useState } from 'react';
import { useClientSideTable } from '../../../shared/hooks/useClientSideTable';
import { fetchDeudoresDashboard } from '../api/deudoresDashboardApi';
import { validateDashboardSearch } from '../validations/validations';
import type {
  DeudorDashboard,
  TipoBusquedaDashboard,
} from '../../../shared/types';

export function useDashboardDeudores(idCliente?: string | null) {
  const [tipoBusqueda, setTipoBusqueda] =
    useState<TipoBusquedaDashboard>('R');

  const [valorBusqueda, setValorBusqueda] = useState('');
  const [allData, setAllData] = useState<DeudorDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const table = useClientSideTable<DeudorDashboard>(
    allData,
    [idCliente],
    { initialPageSize: 10 }
  );

  const buscar = useCallback(async () => {
    const validation = validateDashboardSearch({
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
      const result = await fetchDeudoresDashboard({
        nIdCliente: String(idCliente),
        busqueda: validation.busqueda,
        pageNumber: 1,
        pageSize: 1000,
      });

      setAllData(result);
    } catch (err) {
      setAllData([]);
      setError(
        err instanceof Error
          ? err.message
          : 'Error al buscar deudores.'
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