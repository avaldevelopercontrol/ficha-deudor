import { apiClient } from '@shared/api/apiClient';
import type { ApiResponseSimple } from '@shared/types/indexApi';
import type { InfDeudorCabeceraApi, InfDeudorParamApi } from '../types/infDeudor.types';

const BASE_GESTION = '/v1/Gestion';

export async function fetchInfDeudorCabeceraFalse(signal?: AbortSignal): Promise<InfDeudorCabeceraApi> {
  const result = await apiClient<ApiResponseSimple<InfDeudorCabeceraApi>>(
    `${BASE_GESTION}/GetGestionInformacionDeudor?bTipo_Cabecera=false`,
    { signal }
  );
  if (result.statusCode !== 200) throw new Error(result.message || 'Error cabecera false');
  return result.response;
}

export async function fetchInfDeudorCabeceraTrue(signal?: AbortSignal): Promise<InfDeudorCabeceraApi> {
  const result = await apiClient<ApiResponseSimple<InfDeudorCabeceraApi>>(
    `${BASE_GESTION}/GetGestionInformacionDeudor?bTipo_Cabecera=true`,
    { signal }
  );
  if (result.statusCode !== 200) throw new Error(result.message || 'Error cabecera true');
  return result.response;
}

export async function fetchInfDeudorParams(id_deudor: string, signal?: AbortSignal): Promise<InfDeudorParamApi> {
  const params = new URLSearchParams({ nId_Persdeudor: id_deudor });
  const result = await apiClient<ApiResponseSimple<InfDeudorParamApi>>(
    `${BASE_GESTION}/GetGestionInformacionDeudorParam?${params.toString()}`,
    { signal }
  );
  if (result.statusCode !== 200) throw new Error(result.message || 'Error valores');
  return result.response;
}