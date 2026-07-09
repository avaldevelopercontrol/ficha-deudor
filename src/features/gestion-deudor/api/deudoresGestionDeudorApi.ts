import { apiClient } from '@shared/api/apiClient';
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
}: BuscarDeudoresGestionDeudorParams): Promise<DeudorGestionDeudor[]> {
  const params = new URLSearchParams({
    nId_Cliente: nIdCliente,
    busqueda,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });

  const result = await apiClient<GetDeudoresGestionDeudorResponse>(
    `${GESTION_DEUDOR_API_ENDPOINTS.baseDeudor}${GESTION_DEUDOR_API_ENDPOINTS.getDeudor}?${params.toString()}`
  );

  if (result.statusCode !== 200) {
    throw new Error(
      result.messageUser || result.message || 'Error al buscar el deudor.'
    );
  }

  return mapDeudoresGestionDeudorResponse(result);
}
