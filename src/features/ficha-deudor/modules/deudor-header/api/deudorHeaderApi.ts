import { apiClient } from '@shared/api/apiClient';
import {
  unwrapApiObjectResponse,
} from '../../../shared/utils/apiResponse.utils';
import type {
  CabeceraInfo,
  DeudorInfo,
} from '../../../shared/types';
import {
  isCabeceraInfoApi,
  isDeudorInfoApi,
} from './deudorHeaderApi.validators';

const BASE_GESTION = '/v1/Gestion';

export interface FetchCabeceraHeaderParams {
  idCliente: string;
  idCartera: string;
}

export interface FetchDeudorHeaderParams extends FetchCabeceraHeaderParams {
  idDeudor: string;
}

// ─── GET: Cabecera (Zona, Cartera, Campaña) ───
export async function fetchCabeceraHeader(
  { idCliente, idCartera }: FetchCabeceraHeaderParams,
  signal?: AbortSignal
): Promise<CabeceraInfo> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
  });

  const result = await apiClient<unknown>(
    `${BASE_GESTION}/GetGestionZonaCarteraCampanna?${params.toString()}`,
    {
      signal,
    }
  );

  const api = unwrapApiObjectResponse(
    result,
    'Error cargando información de cabecera',
    isCabeceraInfoApi
  );

  return {
    zona: api.ciudad,
    cartera: api.cCar_Nombre,
    campana: api.cCampanna,
  };
}

// ─── GET: Información del Deudor ───
export async function fetchDeudorHeader(
  { idCliente, idCartera, idDeudor }: FetchDeudorHeaderParams,
  signal?: AbortSignal
): Promise<DeudorInfo> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_Persdeudor: idDeudor,
  });

  const result = await apiClient<unknown>(
    `${BASE_GESTION}/GetGestionDeudor?${params.toString()}`,
    {
      signal,
    }
  );

  const api = unwrapApiObjectResponse(
    result,
    'Error cargando información del deudor',
    isDeudorInfoApi
  );

  return {
    nombreRazonSocial:
      api.nombreCompleto ||
      `${api.nombre} ${api.ruc}`.trim(),
    dniRuc: api.ruc || api.dni || '',
    gradoInstruccion: api.gradoInstruccion,
    edad: api.edad,
    contacto: api.correo,
    asesorPostVenta: api.asesorPostVenta,
    asesorComercial: api.asesorComercial,
    correoApv: api.correoAsesorPostVenta,
    correoAc: api.correoAsesorComercial,
    clientePorVision: api.clientePorVision,
    clienteListaBlanca: api.clienteListaBlanca,
    clienteConSinPe: api.clienteConSinPe,
  };
}