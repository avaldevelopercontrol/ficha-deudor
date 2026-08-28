import { apiClient } from '@shared/api/apiClient';
import type {
  CreateTelefonoResponse,
  TelefonoEditarApi,
  TelefonoFormData,
  TelefonoList,
  TelefonoReferenciado,
} from '../types/telefono.types';
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
import {
  unwrapApiArrayResponse,
  unwrapApiObjectResponse,
} from '../../../shared/utils/apiResponse.utils';
import {
  isCreateTelefonoResponse,
  isTelefonoEditarApi,
  isTelefonoFuenteBusquedaApi,
  isTelefonoHorarioGestionApi,
  isTelefonoOperadorApi,
  isTelefonoReferenciadoApi,
  isTelefonoResultadoApi,
  isTelefonoUbicacionApi,
} from './telefonosReferenciadosApi.validators';

export interface FetchTelefonosReferenciadosParams {
  idCliente: string;
  idDeudor: string;
}

export interface FetchTelefonoByIdParams {
  idTelefono: number;
}

export interface CreateTelefonoParams extends FetchTelefonosReferenciadosParams {
  idUsuario: string;
  data: TelefonoFormData;
}

export interface UpdateTelefonoParams extends CreateTelefonoParams {
  idTelefono: number;
}

const buildTelefonosReferenciadosParams = ({
  idCliente,
  idDeudor,
}: FetchTelefonosReferenciadosParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Persdeudor: idDeudor,
    PageNumber: String(TELEFONOS_REFERENCIADOS_FETCH_PAGE_NUMBER),
    PageSize: String(TELEFONOS_REFERENCIADOS_FETCH_PAGE_SIZE),
  });
};

export async function fetchTelefonosReferenciados(
  params: FetchTelefonosReferenciadosParams,
  signal?: AbortSignal
): Promise<TelefonoReferenciado[]> {
  const searchParams = buildTelefonosReferenciadosParams(params);

  const result = await apiClient<unknown>(
    `${TELEFONOS_REFERENCIADOS_ENDPOINTS.LIST}?${searchParams.toString()}`,
    { signal }
  );

  const telefonos = unwrapApiArrayResponse(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.LIST,
    isTelefonoReferenciadoApi
  );

  return mapTelefonosReferenciados(telefonos);
}

export async function fetchTelefonoById(
  { idTelefono }: FetchTelefonoByIdParams,
  signal?: AbortSignal
): Promise<TelefonoEditarApi> {
  const result = await apiClient<unknown>(
    `${TELEFONOS_REFERENCIADOS_ENDPOINTS.BY_ID}/${idTelefono}`,
    { signal }
  );

  return unwrapApiObjectResponse(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.BY_ID_EDIT,
    isTelefonoEditarApi
  );
}

export async function createTelefono(
  { idDeudor, idUsuario, data }: CreateTelefonoParams,
  signal?: AbortSignal
): Promise<CreateTelefonoResponse> {
  const body = buildCreateTelefonoRequest(idDeudor, idUsuario, data);

  const result = await apiClient<unknown>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.CREATE,
    {
      method: 'POST',
      body,
      signal,
    }
  );

  return unwrapApiObjectResponse(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.CREATE,
    isCreateTelefonoResponse
  );
}

export async function updateTelefono(
  { idDeudor, idUsuario, idTelefono, data }: UpdateTelefonoParams,
  signal?: AbortSignal
): Promise<CreateTelefonoResponse> {
  const body = buildUpdateTelefonoRequest(
    idDeudor,
    idUsuario,
    idTelefono,
    data
  );

  const result = await apiClient<unknown>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.UPDATE,
    {
      method: 'PUT',
      body,
      signal,
    }
  );

  return unwrapApiObjectResponse(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.UPDATE,
    isCreateTelefonoResponse
  );
}

export async function fetchTelefonoResultados(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<unknown>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.RESULTADOS,
    { signal }
  );

  const resultados = unwrapApiArrayResponse(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.RESULTADOS,
    isTelefonoResultadoApi
  );

  return mapTelefonoResultados(resultados);
}

export async function fetchTelefonoOperadores(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<unknown>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.OPERADORES,
    { signal }
  );

  const operadores = unwrapApiArrayResponse(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.OPERADORES,
    isTelefonoOperadorApi
  );

  return mapTelefonoOperadores(operadores);
}

export async function fetchTelefonoUbicaciones(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<unknown>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.UBICACIONES,
    { signal }
  );

  const ubicaciones = unwrapApiArrayResponse(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.UBICACIONES,
    isTelefonoUbicacionApi
  );

  return mapTelefonoUbicaciones(ubicaciones);
}

export async function fetchTelefonoHorarioGestion(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<unknown>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.HORARIO_GESTION,
    { signal }
  );

  const horarios = unwrapApiArrayResponse(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.HORARIO_GESTION,
    isTelefonoHorarioGestionApi
  );

  return mapTelefonoHorarioGestion(horarios);
}

export async function fetchTelefonoFuenteBusqueda(
  signal?: AbortSignal
): Promise<TelefonoList[]> {
  const result = await apiClient<unknown>(
    TELEFONOS_REFERENCIADOS_ENDPOINTS.FUENTE_BUSQUEDA,
    { signal }
  );

  const fuentes = unwrapApiArrayResponse(
    result,
    TELEFONOS_REFERENCIADOS_ERROR_MESSAGES.FUENTE_BUSQUEDA,
    isTelefonoFuenteBusquedaApi
  );

  return mapTelefonoFuenteBusqueda(fuentes);
}