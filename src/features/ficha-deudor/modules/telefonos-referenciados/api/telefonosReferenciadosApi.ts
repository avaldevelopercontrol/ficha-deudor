import { apiClient } from '@shared/api/apiClient';
import type {
  CreateTelefonoResponse,
  TelefonoEditarApi,
  TelefonoFormData,
  TelefonoFuenteBusquedaApi,
  TelefonoHorarioGestionApi,
  TelefonoList,
  TelefonoOperadorApi,
  TelefonoReferenciado,
  TelefonoReferenciadoApi,
  TelefonoResultadoApi,
  TelefonoUbicacionApi,
} from '../types/telefono.types';
import type {
  ApiResponse,
  ApiResponseSimple
} from '@shared/types/indexApi';
import {
  TELEFONOS_REFERENCIADOS_ENDPOINTS,
  TELEFONOS_REFERENCIADOS_ERROR_MESSAGES,
  TELEFONOS_REFERENCIADOS_FETCH_PAGE_NUMBER,
  TELEFONOS_REFERENCIADOS_FETCH_PAGE_SIZE,
} from '../constants/telefonosReferenciados.constants';
import {
  buildCreateTelefonoRequest,
  buildUpdateTelefonoRequest,
  mapTelefonoFuenteBusqueda,
  mapTelefonoHorarioGestion,
  mapTelefonoOperadores,
  mapTelefonoResultados,
  mapTelefonosReferenciados,
  mapTelefonoUbicaciones,
} from '../mappers/telefonosReferenciados.mapper';
import { assertApiSuccess } from '../../../shared/utils/apiResponse.utils';

const buildTelefonosReferenciadosParams = (
  id_cliente: string,
  id_deudor: string
) => {
  return new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Persdeudor: id_deudor,
    PageNumber: String(TELEFONOS_REFERENCIADOS_FETCH_PAGE_NUMBER),
    PageSize: String(TELEFONOS_REFERENCIADOS_FETCH_PAGE_SIZE),
  });
};

export async function fetchTelefonosReferenciados(
  id_cliente: string,
  id_deudor: string
): Promise<TelefonoReferenciado[]> {
  const params = buildTelefonosReferenciadosParams(id_cliente, id_deudor);

  const result = await apiClient<ApiResponse<TelefonoReferenciadoApi[]>>(
    `${TELEFONOS_REFERENCIADOS_ENDPOINTS.LIST}?${params.toString()}`
  );

  assertApiSuccess(result, TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.LIST);

  return mapTelefonosReferenciados(result.response);
}

export async function fetchTelefonoById(
  idTelefono: number,
  signal?: AbortSignal
): Promise<TelefonoEditarApi> {
  const result = await apiClient<ApiResponseSimple<TelefonoEditarApi>>(
    `${TELEFONOS_REFERENCIADOS_ENDPOINTS.BY_ID}/${idTelefono}`,
    { signal }
  );

  assertApiSuccess(result, TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.BY_ID_EDIT);

  return result.response;
}

export async function createTelefono(
  _id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  data: TelefonoFormData
): Promise<CreateTelefonoResponse> {
  const body = buildCreateTelefonoRequest(id_deudor, id_usuario, data);

  const result = await apiClient<ApiResponse<CreateTelefonoResponse>>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.CREATE,
    {
      method: 'POST',
      body,
    }
  );

  assertApiSuccess(result, TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.CREATE);

  return result.response;
}

export async function updateTelefono(
  _id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  id_telefono: number,
  data: TelefonoFormData
): Promise<CreateTelefonoResponse> {
  const body = buildUpdateTelefonoRequest(
    id_deudor,
    id_usuario,
    id_telefono,
    data
  );

  const result = await apiClient<ApiResponse<CreateTelefonoResponse>>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.UPDATE,
    {
      method: 'PUT',
      body,
    }
  );

  assertApiSuccess(result, TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.UPDATE);

  return result.response;
}

export async function fetchTelefonoResultados(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<ApiResponseSimple<TelefonoResultadoApi[]>>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.RESULTADOS,
    { signal }
  );

  assertApiSuccess(result, TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.RESULTADOS);

  return mapTelefonoResultados(result.response);
}

export async function fetchTelefonoOperadores(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<ApiResponseSimple<TelefonoOperadorApi[]>>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.OPERADORES,
    { signal }
  );

  assertApiSuccess(result, TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.OPERADORES);

  return mapTelefonoOperadores(result.response);
}

export async function fetchTelefonoUbicaciones(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<ApiResponseSimple<TelefonoUbicacionApi[]>>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.UBICACIONES,
    { signal }
  );

  assertApiSuccess(result, TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.UBICACIONES);

  return mapTelefonoUbicaciones(result.response);
}

export async function fetchTelefonoHorarioGestion(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<ApiResponseSimple<TelefonoHorarioGestionApi[]>>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.HORARIO_GESTION,
    { signal }
  );

  assertApiSuccess(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.HORARIO_GESTION
  );

  return mapTelefonoHorarioGestion(result.response);
}

export async function fetchTelefonoFuenteBusqueda(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<ApiResponseSimple<TelefonoFuenteBusquedaApi[]>>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.FUENTE_BUSQUEDA,
    { signal }
  );

  assertApiSuccess(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.FUENTE_BUSQUEDA
  );

  return mapTelefonoFuenteBusqueda(result.response);
}