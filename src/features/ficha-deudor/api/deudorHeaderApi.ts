import { apiClient } from '../../../shared/api/apiClient';
import { mockCabeceraHeader, mockMejorRHeader } from '../mocks/mocks/deudorHeaderMock';
import type {
  ApiResponseSimple,
  DeudorInfo,
  DeudorInfoApi,
  CabeceraInfo,
  MejorRInfo,
} from '../../../shared/types/indexApi';

const BASE_GESTION = '/v1/Gestion';

// ─── GET: Cabecera (Zona, Cartera, Campaña) ───
export async function fetchCabeceraHeader(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
): Promise<CabeceraInfo> {
  // Este endpoint aún no está definido en la API, mantener mock por ahora
  return apiClient<CabeceraInfo>(
    `/cabecera-header?id_cliente=${id_cliente}&id_cartera=${id_cartera}&id_deudor=${id_deudor}`,
    {
      mock: () => mockCabeceraHeader[id_cliente] ?? mockCabeceraHeader['default'],
    }
  );
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