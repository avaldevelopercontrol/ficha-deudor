import { apiClient } from '@shared/api/apiClient';
import type {
  GestionRealizada,
  GestionCompleta,
} from '../types/gestionRealizada.types';
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
import {
  unwrapApiArrayResponse,
  unwrapApiPaginatedArrayResponse,
} from '../../../shared/utils/apiResponse.utils';
import {
  isGestionHistoricaApi,
  isGestionRealizadaApi,
} from './gestionesRealizadasApi.validators';

export interface GestionesRealizadasParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
  idUsuario: string;
}

export interface GestionesHistoricasParams {
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
  params: GestionesRealizadasParams,
  signal?: AbortSignal
): Promise<{ resumido: GestionRealizada[] }> {
  const searchParams = buildGestionesRealizadasParams(params);

  const result = await apiClient<unknown>(
    `${GESTIONES_REALIZADAS_ENDPOINTS.RESUMIDAS}?${searchParams.toString()}`,
    { signal }
  );

  const gestiones = unwrapApiArrayResponse(
    result,
    GESTIONES_REALIZADAS_ERROR_MESSAGES.RESUMIDAS,
    isGestionRealizadaApi
  );

  return {
    resumido: mapGestionesRealizadas(gestiones),
  };
}

export async function fetchGestionesHistoricas(
  {
    idCliente,
    idCartera,
    idDeudor,
    pageNumber = GESTIONES_HISTORICAS_DEFAULT_PAGE_NUMBER,
    pageSize = GESTIONES_HISTORICAS_DEFAULT_PAGE_SIZE,
  }: GestionesHistoricasParams,
  signal?: AbortSignal
): Promise<{
  completo: GestionCompleta[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}> {
  const params = buildGestionesHistoricasParams({
    idCliente,
    idCartera,
    idDeudor,
    pageNumber,
    pageSize,
  });

  const result = await apiClient<unknown>(
    `${GESTIONES_REALIZADAS_ENDPOINTS.HISTORICAS}?${params.toString()}`,
    { signal }
  );

  const {
    data: gestionesHistoricas,
    pageNumber: responsePageNumber,
    pageSize: responsePageSize,
    totalRecords,
    totalPages,
  } = unwrapApiPaginatedArrayResponse(
    result,
    GESTIONES_REALIZADAS_ERROR_MESSAGES.HISTORICAS,
    isGestionHistoricaApi
  );

  return {
    completo: mapGestionesHistoricas(gestionesHistoricas),
    pageNumber: responsePageNumber,
    pageSize: responsePageSize,
    totalRecords,
    totalPages,
  };
}