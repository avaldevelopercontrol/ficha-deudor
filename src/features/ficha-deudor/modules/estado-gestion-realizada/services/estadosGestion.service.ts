import {
  fetchEstadosGestion,
  fetchEstadosGestionHistoricos,
} from '../api/estadosGestionApi';
import {
  ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_NUMBER,
  ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_SIZE,
} from '../constants/estadosGestion.constants';
import type {
  EstadoGestion,
  EstadoGestionCompleta,
} from '../types/estadoGestion.types';
import { fetchAllPagesInParallel } from '@shared/utils/pagedCollection.utils';

interface EstadosGestionParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
}

export const loadEstadosGestionResumidos = async (
  {
    idCliente,
    idCartera,
    idDeudor,
  }: EstadosGestionParams,
  signal: AbortSignal
): Promise<EstadoGestion[]> => {
  const result = await fetchEstadosGestion(
    { idCliente, idCartera, idDeudor },
    signal
  );

  return result.resumido;
};

export const loadTodosLosEstadosGestionHistoricos = (
  {
    idCliente,
    idCartera,
    idDeudor,
  }: EstadosGestionParams,
  signal: AbortSignal
): Promise<EstadoGestionCompleta[]> => {
  return fetchAllPagesInParallel({
    firstPageNumber:
      ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_NUMBER,
    fetchPage: (pageNumber) =>
      fetchEstadosGestionHistoricos(
        {
          idCliente,
          idCartera,
          idDeudor,
          pageNumber,
          pageSize: ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_SIZE,
        },
        signal
      ),
    getItems: (page) => page.completo,
    getTotalPages: (page) => page.totalPages,
  });
};
