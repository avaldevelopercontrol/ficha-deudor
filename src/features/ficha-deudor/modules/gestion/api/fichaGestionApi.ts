import { apiClient } from '@shared/api/apiClient';
import type {
  GestionEstadoApi,
  GestionEstadoList,
  GestionTipoApi,
  GestionTipoList,
  GestionPaletaRespuestaApi,
  GestionPaletaRespuestaList,
  GestionPaletaRespuestaParams,
  GestionEstadoClaroApi,
  GestionEstadoClaroList,
  GestionMotivoNoPagoApi,
  GestionMotivoNoPagoList,
  CreateGestionOpeGesContratosPayload,
  CreateGestionOpeGesContratosResponse,
} from '../types/fichaGestion.types';
import type { ApiResponse } from '@shared/types/indexApi';
import { TIPO_GESTION_PALETA } from '../constants/fichaGestion.constants';
import {
  FICHA_GESTION_ENDPOINTS,
  FICHA_GESTION_ERROR_MESSAGES,
} from '../constants/fichaGestionApi.constants';
import {
  mapGestionEstadoClaro,
  mapGestionEstados,
  mapGestionMotivoNoPago,
  mapGestionPaletaRespuesta,
  mapGestionTipos,
} from '../mappers/fichaGestionCatalogos.mapper';
import { assertApiSuccess } from '../../../shared/utils/apiResponse.utils';


export async function fetchGestionEstados(
  idCliente: string,
  signal?: AbortSignal
): Promise<GestionEstadoList[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
  });

  const result = await apiClient<ApiResponse<GestionEstadoApi[]>>(
    `${FICHA_GESTION_ENDPOINTS.ESTADOS}?${params.toString()}`,
    { signal }
  );

  assertApiSuccess(result, FICHA_GESTION_ERROR_MESSAGES.ESTADOS);

  return mapGestionEstados(result.response);
}

export async function fetchGestionTipos(
  signal?: AbortSignal
): Promise<GestionTipoList[]> {
  const result = await apiClient<ApiResponse<GestionTipoApi[]>>(
    FICHA_GESTION_ENDPOINTS.TIPOS,
    { signal }
  );

  assertApiSuccess(result, FICHA_GESTION_ERROR_MESSAGES.TIPOS);

  return mapGestionTipos(result.response);
}

export async function fetchGestionPaletaRespuesta(
  params: GestionPaletaRespuestaParams,
  signal?: AbortSignal
): Promise<GestionPaletaRespuestaList[]> {
  const searchParams = new URLSearchParams({
    nId_Cliente: params.idCliente,
    nId_Contrato: params.idContrato,
    nNivelPaleta: String(params.nivelPaleta),
    nId_SupOpeCodCliOut: String(params.idSupOpeCodCliOut),
    nId_TipoGestion: String(params.idTipoGestion ?? TIPO_GESTION_PALETA),
  });

  const result = await apiClient<ApiResponse<GestionPaletaRespuestaApi[]>>(
    `${FICHA_GESTION_ENDPOINTS.PALETA_RESPUESTA}?${searchParams.toString()}`,
    { signal }
  );

  assertApiSuccess(result, FICHA_GESTION_ERROR_MESSAGES.PALETA_RESPUESTA);

  return mapGestionPaletaRespuesta(result.response);
}

export async function fetchGestionEstadoGestionClaro(
  idCliente: string,
  idCartera: string,
  signal?: AbortSignal
): Promise<GestionEstadoClaroList[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
  });

  const result = await apiClient<ApiResponse<GestionEstadoClaroApi[]>>(
    `${FICHA_GESTION_ENDPOINTS.ESTADO_GESTION_CLARO}?${params.toString()}`,
    { signal }
  );

  assertApiSuccess(result, FICHA_GESTION_ERROR_MESSAGES.ESTADO_GESTION_CLARO);

  return mapGestionEstadoClaro(result.response);
}

export async function fetchGestionMotivoNoPago(
  idCliente: string,
  idCartera: string,
  signal?: AbortSignal
): Promise<GestionMotivoNoPagoList[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
  });

  const result = await apiClient<ApiResponse<GestionMotivoNoPagoApi[]>>(
    `${FICHA_GESTION_ENDPOINTS.MOTIVO_NO_PAGO}?${params.toString()}`,
    { signal }
  );

  assertApiSuccess(result, FICHA_GESTION_ERROR_MESSAGES.MOTIVO_NO_PAGO);

  return mapGestionMotivoNoPago(result.response);
}

export async function createGestionOpeGesContratos(
  payload: CreateGestionOpeGesContratosPayload,
  signal?: AbortSignal
): Promise<ApiResponse<CreateGestionOpeGesContratosResponse[]>> {
  const result = await apiClient<ApiResponse<CreateGestionOpeGesContratosResponse[]>>(
    FICHA_GESTION_ENDPOINTS.CREATE_GESTION,
    {
      method: 'POST',
      body: payload,
      signal,
    }
  );

  assertApiSuccess(result, FICHA_GESTION_ERROR_MESSAGES.CREATE_GESTION);

  return result;
}