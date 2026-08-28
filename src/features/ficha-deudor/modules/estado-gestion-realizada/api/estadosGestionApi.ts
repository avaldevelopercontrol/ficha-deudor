import { apiClient } from '@shared/api/apiClient';
import type {
  EstadoGestion,
  EstadoGestionCompleta,
} from '../types/estadoGestion.types';
import {
  ESTADOS_GESTION_ENDPOINTS,
  ESTADOS_GESTION_ERROR_MESSAGES,
  ESTADOS_GESTION_FETCH_PAGE_NUMBER,
  ESTADOS_GESTION_FETCH_PAGE_SIZE,
  ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_NUMBER,
  ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_SIZE,
} from '../constants/estadosGestion.constants';
import {
  mapEstadosGestion,
  mapEstadosGestionHistoricos,
} from '../mappers/estadosGestion.mapper';
import {
  unwrapApiArrayResponse,
  unwrapApiPaginatedArrayResponse,
} from '../../../shared/utils/apiResponse.utils';
import {
  isEstadoGestionApi,
  isEstadoGestionHistoricaApi,
} from './estadosGestionApi.validators';

export interface EstadosGestionParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
}

export interface EstadosGestionHistoricosParams extends EstadosGestionParams {
  pageNumber?: number;
  pageSize?: number;
}

const buildEstadosGestionParams = ({
  idCliente,
  idCartera,
  idDeudor,
}: EstadosGestionParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_Persdeudor: idDeudor,
    PageNumber: String(ESTADOS_GESTION_FETCH_PAGE_NUMBER),
    PageSize: String(ESTADOS_GESTION_FETCH_PAGE_SIZE),
  });
};

const buildEstadosGestionHistoricosParams = ({
  idCliente,
  idCartera,
  idDeudor,
  pageNumber = ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_NUMBER,
  pageSize = ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_SIZE,
}: EstadosGestionHistoricosParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_PersDeudor: idDeudor,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });
};

export async function fetchEstadosGestion(
  params: EstadosGestionParams,
  signal?: AbortSignal
): Promise<{ resumido: EstadoGestion[] }> {
  const searchParams = buildEstadosGestionParams(params);

  const result = await apiClient<unknown>(
    `${ESTADOS_GESTION_ENDPOINTS.RESUMIDOS}?${searchParams.toString()}`,
    { signal }
  );

  const estados = unwrapApiArrayResponse(
    result,
    ESTADOS_GESTION_ERROR_MESSAGES.RESUMIDOS,
    isEstadoGestionApi
  );

  return {
    resumido: mapEstadosGestion(estados),
  };
}

export async function fetchEstadosGestionHistoricos(
  params: EstadosGestionHistoricosParams,
  signal?: AbortSignal
): Promise<{
  completo: EstadoGestionCompleta[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}> {
  const searchParams = buildEstadosGestionHistoricosParams(params);

  const result = await apiClient<unknown>(
    `${ESTADOS_GESTION_ENDPOINTS.HISTORICOS}?${searchParams.toString()}`,
    { signal }
  );

  const {
    data: estadosHistoricos,
    pageNumber: responsePageNumber,
    pageSize: responsePageSize,
    totalRecords,
    totalPages,
  } = unwrapApiPaginatedArrayResponse(
    result,
    ESTADOS_GESTION_ERROR_MESSAGES.HISTORICOS,
    isEstadoGestionHistoricaApi
  );

  return {
    completo: mapEstadosGestionHistoricos(estadosHistoricos),
    pageNumber: responsePageNumber,
    pageSize: responsePageSize,
    totalRecords,
    totalPages,
  };
}