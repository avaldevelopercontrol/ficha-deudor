import { apiClient } from '@shared/api/apiClient';
import type {
  GestionEstadoList,
  GestionTipoList,
  GestionPaletaRespuestaList,
  GestionPaletaRespuestaParams,
  GestionEstadoClaroList,
  GestionMotivoNoPagoList,
} from '../types/fichaGestionCatalogos.types';
import type {
  CreateGestionOpeGesContratosPayload,
  CreateGestionOpeGesContratosResponse,
  CreateAgendaPayload,
  CreateAgendaResponse,
} from '../types/fichaGestionApi.types';
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
import {
  unwrapApiArrayResponse,
  unwrapApiObjectResponse,
} from '../../../shared/utils/apiResponse.utils';
import {
  isCreateAgendaResponse,
  isCreateGestionOpeGesContratosResponse,
  isGestionEstadoApi,
  isGestionEstadoClaroApi,
  isGestionMotivoNoPagoApi,
  isGestionPaletaRespuestaApi,
  isGestionTipoApi,
} from './fichaGestionApi.validators';

export interface FetchGestionEstadosParams {
  idCliente: string;
}

export interface FetchGestionClienteCarteraParams {
  idCliente: string;
  idCartera: string;
}

export interface CreateGestionParams {
  payload: CreateGestionOpeGesContratosPayload;
}

export interface CreateAgendaParams {
  payload: CreateAgendaPayload;
}


export async function fetchGestionEstados(
  { idCliente }: FetchGestionEstadosParams,
  signal?: AbortSignal
): Promise<GestionEstadoList[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
  });

  const result = await apiClient<unknown>(
    `${FICHA_GESTION_ENDPOINTS.ESTADOS}?${params.toString()}`,
    { signal }
  );

  const estados = unwrapApiArrayResponse(
    result,
    FICHA_GESTION_ERROR_MESSAGES.ESTADOS,
    isGestionEstadoApi
  );

  return mapGestionEstados(estados);
}

export async function fetchGestionTipos(
  signal?: AbortSignal
): Promise<GestionTipoList[]> {
  const result = await apiClient<unknown>(
    FICHA_GESTION_ENDPOINTS.TIPOS,
    { signal }
  );

  const tipos = unwrapApiArrayResponse(
    result,
    FICHA_GESTION_ERROR_MESSAGES.TIPOS,
    isGestionTipoApi
  );

  return mapGestionTipos(tipos);
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

  const result = await apiClient<unknown>(
    `${FICHA_GESTION_ENDPOINTS.PALETA_RESPUESTA}?${searchParams.toString()}`,
    { signal }
  );

  const respuestas = unwrapApiArrayResponse(
    result,
    FICHA_GESTION_ERROR_MESSAGES.PALETA_RESPUESTA,
    isGestionPaletaRespuestaApi
  );

  return mapGestionPaletaRespuesta(respuestas);
}

export async function fetchGestionEstadoGestionClaro(
  { idCliente, idCartera }: FetchGestionClienteCarteraParams,
  signal?: AbortSignal
): Promise<GestionEstadoClaroList[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
  });

  const result = await apiClient<unknown>(
    `${FICHA_GESTION_ENDPOINTS.ESTADO_GESTION_CLARO}?${params.toString()}`,
    { signal }
  );

  const estadosClaro = unwrapApiArrayResponse(
    result,
    FICHA_GESTION_ERROR_MESSAGES.ESTADO_GESTION_CLARO,
    isGestionEstadoClaroApi
  );

  return mapGestionEstadoClaro(estadosClaro);
}

export async function fetchGestionMotivoNoPago(
  { idCliente, idCartera }: FetchGestionClienteCarteraParams,
  signal?: AbortSignal
): Promise<GestionMotivoNoPagoList[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
  });

  const result = await apiClient<unknown>(
    `${FICHA_GESTION_ENDPOINTS.MOTIVO_NO_PAGO}?${params.toString()}`,
    { signal }
  );

  const motivos = unwrapApiArrayResponse(
    result,
    FICHA_GESTION_ERROR_MESSAGES.MOTIVO_NO_PAGO,
    isGestionMotivoNoPagoApi
  );

  return mapGestionMotivoNoPago(motivos);
}

export async function createGestionOpeGesContratos(
  { payload }: CreateGestionParams,
  signal?: AbortSignal
): Promise<CreateGestionOpeGesContratosResponse[]> {
  const result = await apiClient<unknown>(
    FICHA_GESTION_ENDPOINTS.CREATE_GESTION,
    {
      method: 'POST',
      body: payload,
      signal,
    }
  );

  return unwrapApiArrayResponse(
    result,
    FICHA_GESTION_ERROR_MESSAGES.CREATE_GESTION,
    isCreateGestionOpeGesContratosResponse
  );
}

export async function createAgenda(
  { payload }: CreateAgendaParams,
  signal?: AbortSignal
): Promise<CreateAgendaResponse> {
  const result =
    await apiClient<unknown>(
      FICHA_GESTION_ENDPOINTS.CREATE_AGENDA,
      {
        method: 'POST',
        body: payload,
        signal,
      }
    );

  return unwrapApiObjectResponse(
    result,
    FICHA_GESTION_ERROR_MESSAGES.CREATE_AGENDA,
    isCreateAgendaResponse
  );
}