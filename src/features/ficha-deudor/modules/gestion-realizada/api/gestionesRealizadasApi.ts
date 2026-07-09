import { apiClient } from '@shared/api/apiClient';
import type {
  ApiResponse,
  ApiResponseSimple
} from '@shared/types/indexApi';
import type {
  GestionRealizada,
  GestionRealizadaApi,
  GestionCompleta,
  GestionHistoricaApi,
} from '../../../shared/types';
import {
  GESTIONES_HISTORICAS_DEFAULT_PAGE_NUMBER,
  GESTIONES_HISTORICAS_DEFAULT_PAGE_SIZE,
  GESTIONES_REALIZADAS_ENDPOINTS,
  GESTIONES_REALIZADAS_ERROR_MESSAGES,
  GESTIONES_REALIZADAS_FETCH_PAGE_NUMBER,
  GESTIONES_REALIZADAS_FETCH_PAGE_SIZE,
} from '../constants/gestionesRealizadas.constants';
import {
  mapGestionesHistoricas,
  mapGestionesRealizadas,
} from '../mappers/gestionesRealizadas.mapper';
import { assertApiSuccess } from '../../../shared/utils/apiResponse.utils';

interface GestionesRealizadasParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
  idUsuario: string;
}

interface GestionesHistoricasParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
  pageNumber: number;
  pageSize: number;
}

const buildGestionesRealizadasParams = ({
  idCliente,
  idCartera,
  idDeudor,
  idUsuario,
}: GestionesRealizadasParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_Persdeudor: idDeudor,
    nId_PerfilUsuario: idUsuario,
    PageNumber: String(GESTIONES_REALIZADAS_FETCH_PAGE_NUMBER),
    PageSize: String(GESTIONES_REALIZADAS_FETCH_PAGE_SIZE),
  });
};

const buildGestionesHistoricasParams = ({
  idCliente,
  idCartera,
  idDeudor,
  pageNumber,
  pageSize,
}: GestionesHistoricasParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_PersDeudor: idDeudor,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });
};

export async function fetchGestionesRealizadas(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_usuario: string
): Promise<{ resumido: GestionRealizada[] }> {
  const params = buildGestionesRealizadasParams({
    idCliente: id_cliente,
    idCartera: id_cartera,
    idDeudor: id_deudor,
    idUsuario: id_usuario,
  });

  const result = await apiClient<ApiResponseSimple<GestionRealizadaApi[]>>(
    `${GESTIONES_REALIZADAS_ENDPOINTS.RESUMIDAS}?${params.toString()}`
  );

  assertApiSuccess(result, GESTIONES_REALIZADAS_ERROR_MESSAGES.RESUMIDAS);

  return {
    resumido: mapGestionesRealizadas(result.response),
  };
}

export async function fetchGestionesHistoricas(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  pageNumber: number = GESTIONES_HISTORICAS_DEFAULT_PAGE_NUMBER,
  pageSize: number = GESTIONES_HISTORICAS_DEFAULT_PAGE_SIZE
): Promise<{
  completo: GestionCompleta[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}> {
  const params = buildGestionesHistoricasParams({
    idCliente: id_cliente,
    idCartera: id_cartera,
    idDeudor: id_deudor,
    pageNumber,
    pageSize,
  });

  const result = await apiClient<ApiResponse<GestionHistoricaApi[]>>(
    `${GESTIONES_REALIZADAS_ENDPOINTS.HISTORICAS}?${params.toString()}`
  );

  assertApiSuccess(result, GESTIONES_REALIZADAS_ERROR_MESSAGES.HISTORICAS);

  return {
    completo: mapGestionesHistoricas(result.response),
    pageNumber: result.pageNumber,
    pageSize: result.pageSize,
    totalRecords: result.totalRecords,
    totalPages: result.totalPages,
  };
}