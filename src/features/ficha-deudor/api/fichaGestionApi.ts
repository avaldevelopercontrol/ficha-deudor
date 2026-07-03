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

export interface CreateGestionOpeGesContratosPayload {
  nId_DocxCobrarOpe: number;
  nId_Cliente: number;
  nId_Contrato: number;
  nId_Cartera: number;
  nId_DocxCobrars: string;
  nId_PersDeudor: number;
  nId_Usuario: number;
  cNOMBRECONTACTO: string;
  cCARGO: string;
  nNP0: number;
  nNP1: number;
  nNP2: number;
  nESTADOGESTION: number;
  cTELEFONO: string;
  nTIPOGESTION: number;
  nASIGNARGESTOR: number | null;
  dFECHACOMPROMISO: string | null;
  nMONTOSOLES: number;
  nMONTODOLARES: number;
  dFECHANUEVAGESTION: string | null;
  cHORANUEVAGESTION: string;
  cMINUTONUEVAGESTION: string;
  dFECHAGESTION: string;
  cHORAGESTION: string;
  cMINUTOGESTION: string;
  cOBSERVACION: string;
  cSISTEMA: string;
  nESTADOGESTIONCLARO: number;
  nMOTIVONOPAGO: number;
  dFechaInicioGestion: string;
  bEstado: boolean;
}

export interface CreateGestionOpeGesContratosResponse {
  nro: number;
  nId_DocxCobrarOpeGes: number;
  nId_DocxCobrarOpe: number;
  nId_Cliente: number;
  nId_Contrato: number;
  nId_Cartera: number;
  nId_DocxCobrar: number;
  nId_PersDeudor: number;
  nId_Usuario: number;
}

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
    idTipoContacto: item.nId_TipoContacto ?? null,
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

export async function createGestionOpeGesContratos(
  payload: CreateGestionOpeGesContratosPayload,
  signal?: AbortSignal
): Promise<ApiResponse<CreateGestionOpeGesContratosResponse[]>> {
  const result = await apiClient<ApiResponse<CreateGestionOpeGesContratosResponse[]>>(
    `${BASE_GESTION}/CreateGestionOpeGesContratos`,
    {
      method: 'POST',
      body: payload,
      signal,
    }
  );

  if (result.statusCode !== 200) {
    throw new Error(
      result.messageUser ||
        result.message ||
        'Error guardando la gestión'
    );
  }

  return result;
}