import { apiClient } from '@shared/api/apiClient';
import {
  unwrapApiObjectResponse,
} from '../../../shared/utils/apiResponse.utils';
import type {
  InfDeudorCabeceraApi,
  InfDeudorParamApi,
} from '../types/infDeudor.types';
import {
  isInfDeudorCabeceraApi,
  isInfDeudorParamApi,
} from './infDeudorApi.validators';

const BASE_GESTION = '/v1/Gestion';

export interface FetchInfDeudorParams {
  idDeudor: string;
}

export async function fetchInfDeudorCabeceraFalse(
  signal?: AbortSignal
): Promise<InfDeudorCabeceraApi> {
  const result = await apiClient<unknown>(
    `${BASE_GESTION}/GetGestionInformacionDeudor?bTipo_Cabecera=false`,
    { signal }
  );

  return unwrapApiObjectResponse(
    result,
    'Error cabecera false',
    isInfDeudorCabeceraApi
  );
}

export async function fetchInfDeudorCabeceraTrue(
  signal?: AbortSignal
): Promise<InfDeudorCabeceraApi> {
  const result = await apiClient<unknown>(
    `${BASE_GESTION}/GetGestionInformacionDeudor?bTipo_Cabecera=true`,
    { signal }
  );

  return unwrapApiObjectResponse(
    result,
    'Error cabecera true',
    isInfDeudorCabeceraApi
  );
}

export async function fetchInfDeudorParams(
  { idDeudor }: FetchInfDeudorParams,
  signal?: AbortSignal
): Promise<InfDeudorParamApi> {
  const params = new URLSearchParams({
    nId_Persdeudor: idDeudor,
  });

  const result = await apiClient<unknown>(
    `${BASE_GESTION}/GetGestionInformacionDeudorParam?${params.toString()}`,
    { signal }
  );

  return unwrapApiObjectResponse(
    result,
    'Error valores',
    isInfDeudorParamApi
  );
}
