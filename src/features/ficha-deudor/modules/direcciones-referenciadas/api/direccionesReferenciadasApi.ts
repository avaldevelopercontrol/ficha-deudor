import { apiClient } from '@shared/api/apiClient';
import {
  fetchDepartamentos as fetchDepartamentosCatalogo,
} from '@shared/catalogos/departamentos/api/departamentosApi';
import type {
  CreateDireccionResponse,
  DireccionByIdApi,
  DireccionEditFormData,
  DireccionFormData,
  DireccionReferenciada,
  DireccionUbicacion,
  Distrito,
  Provincia,
  UpdateDireccionResponse
} from '../types/direccion.types';
import {
  DIRECCIONES_REFERENCIADAS_ENDPOINTS,
  DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES,
  DIRECCIONES_REFERENCIADAS_FETCH_PAGE_NUMBER,
  DIRECCIONES_REFERENCIADAS_FETCH_PAGE_SIZE,
} from '../constants/direccionesReferenciadas.constants';
import {
  buildCreateDireccionRequest,
  buildUpdateDireccionRequest,
  mapDireccionUbicaciones,
  mapDireccionesReferenciadas,
  mapDistritos,
  mapProvincias,
} from '../mappers/direccionesReferenciadas.mapper';
import {
  unwrapApiArrayResponse,
  unwrapApiObjectResponse,
} from '../../../shared/utils/apiResponse.utils';
import {
  isCreateDireccionResponse,
  isDireccionByIdApi,
  isDireccionReferenciadaApi,
  isDireccionUbicacionApi,
  isDistritoApi,
  isProvinciaApi,
  isUpdateDireccionResponse,
} from './direccionesReferenciadasApi.validators';

export interface FetchDireccionesReferenciadasParams {
  idCliente: string;
  idDeudor: string;
}

export interface CreateDireccionParams extends FetchDireccionesReferenciadasParams {
  idUsuario: string;
  data: DireccionFormData;
}

export interface FetchDireccionByIdParams {
  idDireccion: string;
}

export interface UpdateDireccionParams extends CreateDireccionParams {
  idDireccion: string;
  data: DireccionEditFormData;
}

export interface FetchProvinciasParams {
  idDepartamento: string;
}

export interface FetchDistritosParams extends FetchProvinciasParams {
  idProvincia: string;
}

const buildDireccionesReferenciadasParams = ({
  idCliente,
  idDeudor,
}: FetchDireccionesReferenciadasParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Persdeudor: idDeudor,
    PageNumber: String(DIRECCIONES_REFERENCIADAS_FETCH_PAGE_NUMBER),
    PageSize: String(DIRECCIONES_REFERENCIADAS_FETCH_PAGE_SIZE),
  });
};

const buildDistritosParams = (idProvincia: string) => {
  return new URLSearchParams({
    nId_Provincia: idProvincia,
  });
};

export async function fetchDireccionesReferenciadas(
  params: FetchDireccionesReferenciadasParams,
  signal?: AbortSignal
): Promise<DireccionReferenciada[]> {
  const searchParams = buildDireccionesReferenciadasParams(params);

  const result = await apiClient<unknown>(
    `${DIRECCIONES_REFERENCIADAS_ENDPOINTS.LIST}?${searchParams.toString()}`,
    { signal }
  );

  const direcciones = unwrapApiArrayResponse(
    result,
    DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.LIST,
    isDireccionReferenciadaApi
  );

  return mapDireccionesReferenciadas(direcciones);
}

export async function createDireccion(
  { idCliente, idDeudor, idUsuario, data }: CreateDireccionParams,
  signal?: AbortSignal
): Promise<CreateDireccionResponse> {
  const body = buildCreateDireccionRequest(
    idCliente,
    idDeudor,
    idUsuario,
    data
  );

  const result = await apiClient<unknown>(
    DIRECCIONES_REFERENCIADAS_ENDPOINTS.CREATE,
    {
      method: 'POST',
      body,
      signal,
    }
  );

  return unwrapApiObjectResponse(
    result,
    DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.CREATE,
    isCreateDireccionResponse
  );
}

export async function fetchDireccionById(
  { idDireccion }: FetchDireccionByIdParams,
  signal?: AbortSignal
): Promise<DireccionByIdApi> {
  const result = await apiClient<unknown>(
    `${DIRECCIONES_REFERENCIADAS_ENDPOINTS.BY_ID}/${idDireccion}`,
    { signal }
  );

  return unwrapApiObjectResponse(
    result,
    DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.BY_ID_EDIT,
    isDireccionByIdApi
  );
}

export async function updateDireccion(
  { idCliente, idDeudor, idUsuario, idDireccion, data }: UpdateDireccionParams,
  signal?: AbortSignal
): Promise<UpdateDireccionResponse> {
  const body = buildUpdateDireccionRequest(
    idCliente,
    idDeudor,
    idUsuario,
    idDireccion,
    data
  );

  const result = await apiClient<unknown>(
    DIRECCIONES_REFERENCIADAS_ENDPOINTS.UPDATE,
    {
      method: 'PUT',
      body,
      signal,
    }
  );

  return unwrapApiObjectResponse(
    result,
    DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.UPDATE,
    isUpdateDireccionResponse
  );
}

export const fetchDepartamentos =
  fetchDepartamentosCatalogo;

export async function fetchProvincias(
  { idDepartamento }: FetchProvinciasParams,
  signal?: AbortSignal
): Promise<Provincia[]> {
  const result = await apiClient<unknown>(
    DIRECCIONES_REFERENCIADAS_ENDPOINTS.PROVINCIAS,
    {
      signal,
      headers: {
        nId_Departamento: idDepartamento,
      },
    }
  );

  const provincias = unwrapApiArrayResponse(
    result,
    DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.PROVINCIAS,
    isProvinciaApi
  );

  return mapProvincias(provincias);
}

export async function fetchDistritos(
  { idDepartamento, idProvincia }: FetchDistritosParams,
  signal?: AbortSignal
): Promise<Distrito[]> {
  const params = buildDistritosParams(idProvincia);

  const result = await apiClient<unknown>(
    `${DIRECCIONES_REFERENCIADAS_ENDPOINTS.DISTRITOS}?${params.toString()}`,
    {
      signal,
      headers: {
        nId_Departamento: idDepartamento,
      },
    }
  );

  const distritos = unwrapApiArrayResponse(
    result,
    DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.DISTRITOS,
    isDistritoApi
  );

  return mapDistritos(distritos);
}

export async function fetchDireccionUbicaciones(
  signal?: AbortSignal
): Promise<DireccionUbicacion[]> {
  const result = await apiClient<unknown>(
    DIRECCIONES_REFERENCIADAS_ENDPOINTS.UBICACIONES,
    { signal }
  );

  const ubicaciones = unwrapApiArrayResponse(
    result,
    DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.UBICACIONES,
    isDireccionUbicacionApi
  );

  return mapDireccionUbicaciones(ubicaciones);
}