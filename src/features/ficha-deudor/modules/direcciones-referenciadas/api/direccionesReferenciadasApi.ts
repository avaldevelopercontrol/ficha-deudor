import { apiClient } from '@shared/api/apiClient';
import type {
  CreateDireccionResponse,
  Departamento,
  DepartamentoApi,
  DireccionByIdApi,
  DireccionEditFormData,
  DireccionFormData,
  DireccionReferenciada,
  DireccionReferenciadaApi,
  DireccionUbicacion,
  DireccionUbicacionApi,
  Distrito,
  DistritoApi,
  Provincia,
  ProvinciaApi,
  UpdateDireccionResponse
} from '../types/direccion.types';
import type {
  ApiResponse,
  ApiResponseSimple
} from '@shared/types/indexApi';
import {
  DIRECCIONES_REFERENCIADAS_ENDPOINTS,
  DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES,
  DIRECCIONES_REFERENCIADAS_FETCH_PAGE_NUMBER,
  DIRECCIONES_REFERENCIADAS_FETCH_PAGE_SIZE,
} from '../constants/direccionesReferenciadas.constants';
import {
  buildCreateDireccionRequest,
  buildUpdateDireccionRequest,
  mapDepartamentos,
  mapDireccionUbicaciones,
  mapDireccionesReferenciadas,
  mapDistritos,
  mapProvincias,
} from '../mappers/direccionesReferenciadas.mapper';
import { assertApiSuccess } from '../../../shared/utils/apiResponse.utils';

const buildDireccionesReferenciadasParams = (
  id_cliente: string,
  id_deudor: string
) => {
  return new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Persdeudor: id_deudor,
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
  id_cliente: string,
  id_deudor: string
): Promise<DireccionReferenciada[]> {
  const params = buildDireccionesReferenciadasParams(id_cliente, id_deudor);

  const result = await apiClient<ApiResponse<DireccionReferenciadaApi[]>>(
    `${DIRECCIONES_REFERENCIADAS_ENDPOINTS.LIST}?${params.toString()}`
  );

  assertApiSuccess(result, DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.LIST);

  return mapDireccionesReferenciadas(result.response);
}

export async function createDireccion(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  data: DireccionFormData
): Promise<CreateDireccionResponse> {
  const body = buildCreateDireccionRequest(
    id_cliente,
    id_deudor,
    id_usuario,
    data
  );

  const result = await apiClient<ApiResponse<CreateDireccionResponse>>(
    DIRECCIONES_REFERENCIADAS_ENDPOINTS.CREATE,
    {
      method: 'POST',
      body,
    }
  );

  assertApiSuccess(result, DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.CREATE);

  return result.response;
}

export async function fetchDireccionById(
  idDireccion: string,
  signal?: AbortSignal
): Promise<DireccionByIdApi> {
  const result = await apiClient<ApiResponse<DireccionByIdApi>>(
    `${DIRECCIONES_REFERENCIADAS_ENDPOINTS.BY_ID}/${idDireccion}`,
    { signal }
  );

  assertApiSuccess(result, DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.BY_ID_EDIT);

  return result.response;
}

export async function updateDireccion(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  id_direccion: string,
  data: DireccionEditFormData
): Promise<UpdateDireccionResponse> {
  const body = buildUpdateDireccionRequest(
    id_cliente,
    id_deudor,
    id_usuario,
    id_direccion,
    data
  );

  const result = await apiClient<ApiResponse<UpdateDireccionResponse>>(
    DIRECCIONES_REFERENCIADAS_ENDPOINTS.UPDATE,
    {
      method: 'PUT',
      body,
    }
  );

  assertApiSuccess(result, DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.UPDATE);

  return result.response;
}

export async function fetchDepartamentos(
  signal?: AbortSignal
): Promise<Departamento[]> {
  const result = await apiClient<ApiResponseSimple<DepartamentoApi[]>>(
    DIRECCIONES_REFERENCIADAS_ENDPOINTS.DEPARTAMENTOS,
    { signal }
  );

  assertApiSuccess(
    result,
    DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.DEPARTAMENTOS
  );

  return mapDepartamentos(result.response);
}

export async function fetchProvincias(
  idDepartamento: string,
  signal?: AbortSignal
): Promise<Provincia[]> {
  const result = await apiClient<ApiResponseSimple<ProvinciaApi[]>>(
    DIRECCIONES_REFERENCIADAS_ENDPOINTS.PROVINCIAS,
    {
      signal,
      headers: {
        nId_Departamento: idDepartamento,
      },
    }
  );

  assertApiSuccess(result, DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.PROVINCIAS);

  return mapProvincias(result.response);
}

export async function fetchDistritos(
  idDepartamento: string,
  idProvincia: string,
  signal?: AbortSignal
): Promise<Distrito[]> {
  const params = buildDistritosParams(idProvincia);

  const result = await apiClient<ApiResponseSimple<DistritoApi[]>>(
    `${DIRECCIONES_REFERENCIADAS_ENDPOINTS.DISTRITOS}?${params.toString()}`,
    {
      signal,
      headers: {
        nId_Departamento: idDepartamento,
      },
    }
  );

  assertApiSuccess(result, DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.DISTRITOS);

  return mapDistritos(result.response);
}

export async function fetchDireccionUbicaciones(
  signal?: AbortSignal
): Promise<DireccionUbicacion[]> {
  const result = await apiClient<ApiResponseSimple<DireccionUbicacionApi[]>>(
    DIRECCIONES_REFERENCIADAS_ENDPOINTS.UBICACIONES,
    { signal }
  );

  assertApiSuccess(result, DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.UBICACIONES);

  return mapDireccionUbicaciones(result.response);
}