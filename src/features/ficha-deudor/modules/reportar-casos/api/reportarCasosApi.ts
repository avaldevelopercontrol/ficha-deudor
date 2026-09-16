import { apiClient } from '@shared/api/apiClient';

import {
  unwrapApiArrayResponse,
  unwrapApiObjectResponse,
} from '../../../shared/utils/apiResponse.utils';
import {
  isCreateReportarCasoResponse,
  isReportarCasoApi,
  isReportarCasoByIdApi,
  isUpdateReportarCasoResponse,
} from './reportarCasosApi.validators';
import {
  buildCreateReportarCasoRequest,
  buildUpdateReportarCasoRequest,
} from '../mappers/reportarCasoRequest.mapper';
import type {
  CreateReportarCasoResponse,
  ReportarCaso,
  ReportarCasoByIdApi,
  ReportarCasoFormData,
  UpdateReportarCasoResponse,
} from '../types/reportarCaso.types';

const REPORTAR_CASOS_LIST_ENDPOINT = '/v1/Boton/GetReportarCasos';
const REPORTAR_CASOS_CREATE_ENDPOINT = '/v1/Boton/CreateReportarCasos';
const REPORTAR_CASOS_EDIT_ENDPOINT = '/v1/Boton/EditReportarCasos';

const REPORTAR_CASOS_ERROR_MESSAGES = {
  list: 'Error cargando casos reportados',
  create: 'Error al registrar el caso',
  byId: 'Error cargando el caso para editar',
  update: 'Error al actualizar el caso',
} as const;

const FALLBACK_TEXT = '—';

export interface FetchReportarCasosParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
}

export interface CreateReportarCasoParams extends FetchReportarCasosParams {
  idUsuario: string;
  data: ReportarCasoFormData;
}

export interface FetchReportarCasoByIdParams {
  idCaso: string;
}

export interface UpdateReportarCasoParams extends FetchReportarCasosParams {
  idUsuario: string;
  original: ReportarCasoByIdApi;
  data: ReportarCasoFormData;
}

export async function fetchReportarCasos(
  { idCliente, idCartera, idDeudor }: FetchReportarCasosParams,
  signal?: AbortSignal
): Promise<ReportarCaso[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_PersDeudor: idDeudor,
  });

  const result = await apiClient<unknown>(
    `${REPORTAR_CASOS_LIST_ENDPOINT}?${params.toString()}`,
    { signal }
  );

  const casos = unwrapApiArrayResponse(
    result,
    REPORTAR_CASOS_ERROR_MESSAGES.list,
    isReportarCasoApi
  );

  return casos.map((item) => ({
    id: String(item.id),
    caso: item.caso.trim() || FALLBACK_TEXT,
    descripcion: item.descripcion.trim() || FALLBACK_TEXT,
    cartera: item.cartera.trim() || FALLBACK_TEXT,
    usuario: item.usuario.trim() || FALLBACK_TEXT,
    fechaIngreso: item.fec_Ingreso,
  }));
}

export async function createReportarCaso(
  {
    idCliente,
    idCartera,
    idDeudor,
    idUsuario,
    data,
  }: CreateReportarCasoParams,
  signal?: AbortSignal
): Promise<CreateReportarCasoResponse> {
  const body = buildCreateReportarCasoRequest(
    idCliente,
    idCartera,
    idDeudor,
    idUsuario,
    data
  );

  const result = await apiClient<unknown>(
    REPORTAR_CASOS_CREATE_ENDPOINT,
    {
      method: 'POST',
      body,
      signal,
    }
  );

  return unwrapApiObjectResponse(
    result,
    REPORTAR_CASOS_ERROR_MESSAGES.create,
    isCreateReportarCasoResponse
  );
}


export async function fetchReportarCasoById(
  { idCaso }: FetchReportarCasoByIdParams,
  signal?: AbortSignal
): Promise<ReportarCasoByIdApi> {
  const result = await apiClient<unknown>(
    `${REPORTAR_CASOS_LIST_ENDPOINT}/${encodeURIComponent(idCaso)}`,
    { signal }
  );

  return unwrapApiObjectResponse(
    result,
    REPORTAR_CASOS_ERROR_MESSAGES.byId,
    isReportarCasoByIdApi
  );
}

export async function updateReportarCaso(
  {
    idCliente,
    idCartera,
    idDeudor,
    idUsuario,
    original,
    data,
  }: UpdateReportarCasoParams,
  signal?: AbortSignal
): Promise<UpdateReportarCasoResponse> {
  const body = buildUpdateReportarCasoRequest(
    idCliente,
    idCartera,
    idDeudor,
    idUsuario,
    original,
    data
  );

  const result = await apiClient<unknown>(
    REPORTAR_CASOS_EDIT_ENDPOINT,
    {
      method: 'PUT',
      body,
      signal,
    }
  );

  return unwrapApiObjectResponse(
    result,
    REPORTAR_CASOS_ERROR_MESSAGES.update,
    isUpdateReportarCasoResponse
  );
}
