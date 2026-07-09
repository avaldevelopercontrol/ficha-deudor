import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@features/auth/contexts/authContextValue';
import { useGestionDeudores } from '../../hooks/useGestionDeudores';
import { useGestionDeudorColumns } from '../../modules/listado/hooks/useGestionDeudorColumns';
import { useGestionDeudorNavigation } from './useGestionDeudorNavigation';

export const useGestionDeudorPage = () => {
  const [searchParams] = useSearchParams();
  const { usuario, clienteSeleccionada } = useAuth();

  const idCliente =
    searchParams.get('id_cliente') || clienteSeleccionada?.id_cliente || '';

  const idUsuario = searchParams.get('id_usuario') || usuario?.id_usuario || '';

  const deudores = useGestionDeudores(idCliente);
  const columns = useGestionDeudorColumns();
  const { goToFichaDeudor } = useGestionDeudorNavigation({
    idCliente,
    idUsuario,
  });

  const indiceInicio = (deudores.pageNumber - 1) * deudores.pageSize;
  const indiceFin = Math.min(
    indiceInicio + deudores.pageSize,
    deudores.totalRecords
  );

  return {
    searchProps: {
      tipoBusqueda: deudores.tipoBusqueda,
      valorBusqueda: deudores.valorBusqueda,
      isLoading: deudores.isLoading,
      error: deudores.error,
      onTipoBusquedaChange: deudores.setTipoBusqueda,
      onValorBusquedaChange: deudores.setValorBusqueda,
      onBuscar: deudores.buscar,
      onLimpiar: deudores.limpiar,
    },
    resultsProps: {
      columns,
      data: deudores.paginatedData,
      isLoading: deudores.isLoading,
      pageNumber: deudores.pageNumber,
      pageSize: deudores.pageSize,
      totalRecords: deudores.totalRecords,
      totalPages: deudores.totalPages,
      indiceInicio,
      indiceFin,
      onRowClick: goToFichaDeudor,
      onPageNumberChange: deudores.setPageNumber,
      onPageSizeChange: deudores.setPageSize,
    },
  };
};
