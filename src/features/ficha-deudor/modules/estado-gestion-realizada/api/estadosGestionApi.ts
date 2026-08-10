import { apiClient } from '@shared/api/apiClient';
import type {
  ApiResponse,
  ApiResponseSimple
} from '@shared/types/indexApi';
import type {
  EstadoGestion,
  EstadoGestionApi,
  EstadoGestionCompleta,
  EstadoGestionHistoricaApi,
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
} from '../../../shared/utils/apiResponse.utils';

const buildEstadosGestionParams = (
  id_cliente: string,
  id_cartera: string,
  id_deudor: string
) => {
  return new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
    nId_Persdeudor: id_deudor,
    PageNumber: String(ESTADOS_GESTION_FETCH_PAGE_NUMBER),
    PageSize: String(ESTADOS_GESTION_FETCH_PAGE_SIZE),
  });
};

const buildEstadosGestionHistoricosParams = (
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  pageNumber: number,
  pageSize: number
) => {
  return new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
    nId_PersDeudor: id_deudor,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });
};

export async function fetchEstadosGestion(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  signal?: AbortSignal
): Promise<{ resumido: EstadoGestion[] }> {
  const params = buildEstadosGestionParams(
    id_cliente,
    id_cartera,
    id_deudor
  );

  const result = await apiClient<ApiResponseSimple<EstadoGestionApi[]>>(
    `${ESTADOS_GESTION_ENDPOINTS.RESUMIDOS}?${params.toString()}`,
    { signal }
  );

  const estados = unwrapApiArrayResponse<EstadoGestionApi>(
    result,
    ESTADOS_GESTION_ERROR_MESSAGES.RESUMIDOS
  );

  return {
    resumido: mapEstadosGestion(estados),
  };
}

export async function fetchEstadosGestionHistoricos(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  pageNumber = ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_NUMBER,
  pageSize = ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_SIZE,
  signal?: AbortSignal
): Promise<{
  completo: EstadoGestionCompleta[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}> {
  const params = buildEstadosGestionHistoricosParams(
    id_cliente,
    id_cartera,
    id_deudor,
    pageNumber,
    pageSize
  );

  const result = await apiClient<ApiResponse<EstadoGestionHistoricaApi[]>>(
    `${ESTADOS_GESTION_ENDPOINTS.HISTORICOS}?${params.toString()}`,
    { signal }
  );

  const estadosHistoricos = unwrapApiArrayResponse<EstadoGestionHistoricaApi>(
    result,
    ESTADOS_GESTION_ERROR_MESSAGES.HISTORICOS
  );

  return {
    completo: mapEstadosGestionHistoricos(estadosHistoricos),
    pageNumber: result.pageNumber,
    pageSize: result.pageSize,
    totalRecords: result.totalRecords,
    totalPages: result.totalPages,
  };
}