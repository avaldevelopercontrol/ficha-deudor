import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AUTH_ROUTES } from '@features/auth/constants';
import { useAuth } from '@features/auth/contexts/authContextValue';
import { clearFichaDeudorSession } from '@features/ficha-deudor/shared/utils/fichaDeudorSession.utils';

import { useGestionDeudores } from '../../hooks/useGestionDeudores';
import { useGestionDeudorColumns } from '../../modules/listado/hooks/useGestionDeudorColumns';
import { useGestionDeudorNavigation } from './useGestionDeudorNavigation';

export const useGestionDeudorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { usuario, clienteSeleccionada } = useAuth();

  const idCliente = clienteSeleccionada?.id_cliente ?? '';
  const idUsuario = usuario?.id_usuario ?? '';

  useEffect(() => {
    /*
     * Al regresar al listado, la ficha anterior deja de ser
     * el contexto activo.
     */
    clearFichaDeudorSession();

    /*
     * Compatibilidad con entradas antiguas del historial:
     * /gestion-deudor?id_cliente=...&id_usuario=...
     */
    if (location.search) {
      navigate(AUTH_ROUTES.GESTION_DEUDOR, {
        replace: true,
      });
    }
  }, [location.search, navigate]);

  const deudores = useGestionDeudores(idCliente);
  const columns = useGestionDeudorColumns();

  const { goToFichaDeudor } = useGestionDeudorNavigation({
    idCliente,
    idUsuario,
  });

  const indiceInicio =
    (deudores.pageNumber - 1) * deudores.pageSize;

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