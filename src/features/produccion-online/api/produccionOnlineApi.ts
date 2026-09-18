import {
  apiClient,
} from '@shared/api/apiClient';
import {
  assertApiBusinessSuccess,
} from '@shared/api/apiResponse.utils';

import {
  PRODUCCION_ONLINE_TEXTS,
} from '../constants/produccionOnline.constants';
import {
  mapClientesProduccionResponse,
  mapPerfilesProduccionResponse,
  mapProduccionResumenResponse,
  mapProvinciasProduccionResponse,
} from '../mappers/produccionOnline.mapper';
import type {
  ProduccionOnlineCatalogs,
  ProduccionOnlineFilters,
  ProduccionOnlineRow,
} from '../types/produccionOnline.types';
import {
  parseProduccionApiEnvelope,
} from './produccionOnlineApi.contract';
import {
  buildProduccionResumenEndpoint,
  PRODUCCION_ONLINE_API_ENDPOINTS,
} from './produccionOnlineApi.endpoints';

const fetchProduccionResponse = async (
  endpoint: string,
  signal: AbortSignal | undefined,
  fallbackMessage: string
): Promise<unknown> => {
  const rawResult = await apiClient<unknown>(
    endpoint,
    {
      method: 'GET',
      signal,
    }
  );

  const result = parseProduccionApiEnvelope(
    rawResult,
    fallbackMessage
  );

  assertApiBusinessSuccess(
    result,
    fallbackMessage
  );

  return result.response;
};

export const fetchProvinciasProduccion = async (
  signal?: AbortSignal
) =>
  mapProvinciasProduccionResponse(
    await fetchProduccionResponse(
      PRODUCCION_ONLINE_API_ENDPOINTS.provincias,
      signal,
      PRODUCCION_ONLINE_TEXTS.catalogsError
    )
  );

export const fetchPerfilesProduccion = async (
  signal?: AbortSignal
) =>
  mapPerfilesProduccionResponse(
    await fetchProduccionResponse(
      PRODUCCION_ONLINE_API_ENDPOINTS.perfiles,
      signal,
      PRODUCCION_ONLINE_TEXTS.catalogsError
    )
  );

export const fetchClientesProduccionActivos = async (
  signal?: AbortSignal
) =>
  mapClientesProduccionResponse(
    await fetchProduccionResponse(
      PRODUCCION_ONLINE_API_ENDPOINTS.clientes,
      signal,
      PRODUCCION_ONLINE_TEXTS.catalogsError
    )
  );

export const fetchProduccionOnlineCatalogs = async (
  signal?: AbortSignal
): Promise<ProduccionOnlineCatalogs> => {
  const [provincias, perfiles, clientes] =
    await Promise.all([
      fetchProvinciasProduccion(signal),
      fetchPerfilesProduccion(signal),
      fetchClientesProduccionActivos(signal),
    ]);

  return {
    provincias,
    perfiles,
    clientes,
  };
};

export const fetchProduccionResumen = async (
  filters: ProduccionOnlineFilters,
  signal?: AbortSignal
): Promise<ProduccionOnlineRow[]> =>
  mapProduccionResumenResponse(
    await fetchProduccionResponse(
      buildProduccionResumenEndpoint(filters),
      signal,
      PRODUCCION_ONLINE_TEXTS.summaryError
    )
  );
