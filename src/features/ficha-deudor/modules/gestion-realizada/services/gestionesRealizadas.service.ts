import {
  fetchGestionesHistoricas,
  fetchGestionesRealizadas,
} from '../api/gestionesRealizadasApi';
import {
  GESTIONES_HISTORICAS_DEFAULT_PAGE_NUMBER,
  GESTIONES_HISTORICAS_DEFAULT_PAGE_SIZE,
} from '../constants/gestionesRealizadas.constants';
import type {
  GestionCompleta,
  GestionRealizada,
} from '../types/gestionRealizada.types';
import { fetchAllPagesInParallel } from '@shared/utils/pagedCollection.utils';

interface GestionesBaseParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
}

interface GestionesResumidasParams extends GestionesBaseParams {
  idUsuario: string;
}

export const loadGestionesResumidas = async (
  {
    idCliente,
    idCartera,
    idDeudor,
    idUsuario,
  }: GestionesResumidasParams,
  signal: AbortSignal
): Promise<GestionRealizada[]> => {
  const result = await fetchGestionesRealizadas(
    { idCliente, idCartera, idDeudor, idUsuario },
    signal
  );

  return result.resumido;
};

export const loadTodasLasGestionesHistoricas = (
  {
    idCliente,
    idCartera,
    idDeudor,
  }: GestionesBaseParams,
  signal: AbortSignal
): Promise<GestionCompleta[]> => {
  return fetchAllPagesInParallel({
    firstPageNumber:
      GESTIONES_HISTORICAS_DEFAULT_PAGE_NUMBER,
    fetchPage: (pageNumber) =>
      fetchGestionesHistoricas(
        {
          idCliente,
          idCartera,
          idDeudor,
          pageNumber,
          pageSize: GESTIONES_HISTORICAS_DEFAULT_PAGE_SIZE,
        },
        signal
      ),
    getItems: (page) => page.completo,
    getTotalPages: (page) => page.totalPages,
  });
};
