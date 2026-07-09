import { apiClient } from '@shared/api/apiClient';
import { mockMejorRHeader } from '../constants/catalogoDeudorHeader.constants';
import type { ApiResponseSimple } from '@shared/types/indexApi';
import type {
  CabeceraInfoApi,
  CabeceraInfo,
  DeudorInfo,
  DeudorInfoApi,
  MejorRInfo,
} from '../../../shared/types';

const BASE_GESTION = '/v1/Gestion';

// ─── GET: Cabecera (Zona, Cartera, Campaña) ───
export async function fetchCabeceraHeader(
  id_cliente: string,
  id_cartera: string,
): Promise<CabeceraInfo> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
  });

  const result = await apiClient<ApiResponseSimple<CabeceraInfoApi>>(
    `${BASE_GESTION}/GetGestionZonaCarteraCampanna?${params.toString()}`,
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando información de cabecera');
  }

  const api = result.response;

  return {
    zona: api.ciudad,
    cartera: api.cCar_Nombre,
    campana: api.cCampanna,
  };
}

// ─── GET: Información del Deudor ───
export async function fetchDeudorHeader(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
): Promise<DeudorInfo> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
    nId_Persdeudor: id_deudor,
  });

  const result = await apiClient<ApiResponseSimple<DeudorInfoApi>>(
    `${BASE_GESTION}/GetGestionDeudor?${params.toString()}`,
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando información del deudor');
  }

  const api = result.response;

  return {
    nombreRazonSocial: api.nombreCompleto || `${api.nombre} ${api.ruc}`.trim(),
    dniRuc: api.ruc || api.dni || '',
    gradoInstruccion: api.gradoInstruccion,
    edad: api.edad,
    contacto: api.correo,
    asesorPostVenta: api.asesorPostVenta,
    asesorComercial: api.asesorComercial,
    correoApv: api.correoAsesorPostVenta,
    correoAc: api.correoAsesorComercial,
  };
}

// ─── GET: Mejor Resultado ───
export async function fetchMejorRHeader(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
): Promise<MejorRInfo> {
  // Este endpoint aún no está definido en la API, mantener mock por ahora
  return apiClient<MejorRInfo>(
    `/mejorR-header?id_cliente=${id_cliente}&id_cartera=${id_cartera}&id_deudor=${id_deudor}`,
    {
      mock: () => mockMejorRHeader[id_cliente] ?? mockMejorRHeader['default'],
    }
  );
}