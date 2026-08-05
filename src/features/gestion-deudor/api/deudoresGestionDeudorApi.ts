import { apiClient } from '@shared/api/apiClient';
import { toRequiredId } from '@shared/utils/number.utils';
import {
  assertApiSuccess,
} from '@shared/api/apiResponse.utils';
import {
  GESTION_DEUDOR_API_DEFAULTS,
  GESTION_DEUDOR_API_ENDPOINTS,
} from '../constants/gestionDeudorApi.constants';
import { mapDeudoresGestionDeudorResponse } from '../mappers/gestionDeudor.mapper';
import type {
  BuscarDeudoresGestionDeudorParams,
  DeudorGestionDeudor,
  GetDeudoresGestionDeudorResponse,
} from '../types/gestionDeudor.types';

export async function fetchDeudoresGestionDeudor({
  nIdCliente,
  busqueda,
  pageNumber = GESTION_DEUDOR_API_DEFAULTS.pageNumber,
  pageSize = GESTION_DEUDOR_API_DEFAULTS.pageSize,
}: BuscarDeudoresGestionDeudorParams,
  signal?: AbortSignal
): Promise<DeudorGestionDeudor[]> {
  const normalizedClientId = toRequiredId(
    nIdCliente,
    'nId_Cliente'
  );

  const params = new URLSearchParams({
    nId_Cliente: String(normalizedClientId),
    busqueda,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });

  const result = await apiClient<GetDeudoresGestionDeudorResponse>(
    `${GESTION_DEUDOR_API_ENDPOINTS.baseDeudor}${GESTION_DEUDOR_API_ENDPOINTS.getDeudor}?${params.toString()}`,
    { signal }
  );

  assertApiSuccess(
    result,
    'Error al buscar el deudor.'
  );

  return mapDeudoresGestionDeudorResponse(result);
}
