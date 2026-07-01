import { apiClient } from '../../../shared/api/apiClient';
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
} from '../../../shared/types';
import type { ApiResponse } from '../../../shared/types/indexApi';

const BASE_GESTION = '/v1/Gestion';

export async function fetchGestionEstados(
  idCliente: string,
  signal?: AbortSignal
): Promise<GestionEstadoList[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
  });

  const result = await apiClient<ApiResponse<GestionEstadoApi[]>>(
    `${BASE_GESTION}/GetGestionEstadoGestion?${params.toString()}`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando estados de gestión');
  }

  return (result.response ?? []).map((item) => ({
    id: String(item.nId_OpeCodCliOut),
    nombre: item.cNombre_OpeCodCliOut,
  }));
}

export async function fetchGestionTipos(
  signal?: AbortSignal
): Promise<GestionTipoList[]> {
  const result = await apiClient<ApiResponse<GestionTipoApi[]>>(
    `${BASE_GESTION}/GetGestionTipoGestion`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando tipos de gestión');
  }

  return (result.response ?? []).map((item) => ({
    id: String(item.nId_TipoGestion),
    nombre: item.cNomTipoGestion,
  }));
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
    nId_TipoGestion: String(params.idTipoGestion ?? 3),
  });

  const result = await apiClient<ApiResponse<GestionPaletaRespuestaApi[]>>(
    `${BASE_GESTION}/GetGestionPaletaRespuesta?${searchParams.toString()}`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando paleta de respuesta');
  }

  return (result.response ?? []).map((item) => ({
    id: String(item.nId_OpeCodCliOut),
    nombre: item.cNombre_OpeCodCliOut,
  }));
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
    `${BASE_GESTION}/GetGestionEstadoGestionClaro?${params.toString()}`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando Estado Gestión Claro');
  }

  return (result.response ?? []).map((item) => ({
    id: String(item.nId_OpeCodCliOut),
    nombre: item.cNombre_OpeCodCliOut,
  }));
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
    `${BASE_GESTION}/GetGestionMotivoNoPago?${params.toString()}`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando Motivo No Pago');
  }

  return (result.response ?? []).map((item) => ({
    id: String(item.nId_MotivoNoPago),
    nombre: item.cNombreMotivoNoPago,
  }));
}