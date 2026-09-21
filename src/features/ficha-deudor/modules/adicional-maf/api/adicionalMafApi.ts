import { apiClient } from '@shared/api/apiClient';

import {
  unwrapApiObjectResponse,
} from '../../../shared/utils/apiResponse.utils';
import { ADICIONAL_MAF_API_MESSAGES } from '../constants/adicionalMafPopup.constants';
import { mapAdicionalMaf } from '../mappers/adicionalMaf.mapper';
import type { AdicionalMaf } from '../types/adicionalMaf.types';
import { isAdicionalMafApi } from './adicionalMafApi.validators';

const ADICIONAL_MAF_ENDPOINT = '/v1/Boton/GetOperativasMaf';

export interface FetchAdicionalMafParams {
  idDeudor: string;
  idCartera: string;
  idCliente: string;
}

export async function fetchAdicionalMaf(
  {
    idDeudor,
    idCartera,
    idCliente,
  }: FetchAdicionalMafParams,
  signal?: AbortSignal
): Promise<AdicionalMaf> {
  const params = new URLSearchParams({
    nId_PersDeudor: idDeudor,
    nId_Cartera: idCartera,
    nId_Cliente: idCliente,
  });

  const result = await apiClient<unknown>(
    `${ADICIONAL_MAF_ENDPOINT}?${params.toString()}`,
    { signal }
  );

  const api = unwrapApiObjectResponse(
    result,
    ADICIONAL_MAF_API_MESSAGES.loadError,
    isAdicionalMafApi
  );

  return mapAdicionalMaf(api);
}
