import { ApiError } from '@shared/api/apiClient';
import { analyticsApiClient } from '@shared/api/analyticsApiClient';

import type {
  AnalyticsAccessContext,
  AnalyticsPowerBiOptionAccess,
  AnalyticsPowerBiViewerContext,
  AnalyticsReportClientOption,
  AnalyticsScope,
} from '../domain/analyticsAccess.types';
import {
  mapAnalyticsOptionClientsToScopes,
  mapAnalyticsPowerBiOptionAccess,
  mapAnalyticsPowerBiViewerContext,
  mapAnalyticsReportClients,
} from './analyticsAccess.mapper';
import {
  parseAnalyticsOptionClientsDto,
  parseAnalyticsPowerBiAccessDto,
  parseAnalyticsPowerBiViewerContextDto,
  parseAnalyticsReportClientsDto,
} from './analyticsAccess.validators';

const isPositiveInteger = (
  value: number
): boolean =>
  Number.isSafeInteger(value) && value > 0;

const assertPositiveInteger = (
  name: string,
  value: number
): void => {
  if (!isPositiveInteger(value)) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
};

const normalizeReportClientInput = (
  client: AnalyticsReportClientOption | null
): AnalyticsReportClientOption | null => {
  if (client === null) {
    return null;
  }

  assertPositiveInteger('clientId', client.clientId);
  const name = client.name.trim();

  if (!name) {
    throw new Error(
      'La selección de cartera no es válida.'
    );
  }

  return {
    clientId: client.clientId,
    name,
  };
};

export async function getAnalyticsPowerBiOptionAccess(
  optionIds: readonly number[],
  signal?: AbortSignal
): Promise<AnalyticsPowerBiOptionAccess[]> {
  const normalizedOptionIds = [...new Set(optionIds)]
    .filter(isPositiveInteger)
    .sort((left, right) => left - right);

  if (normalizedOptionIds.length === 0) {
    return [];
  }

  const query = new URLSearchParams({
    optionIds: normalizedOptionIds.join(','),
  });
  const rawResponse = await analyticsApiClient.get<unknown>(
    `/api/v1/analytics-access/user/power-bi-access?${query.toString()}`,
    {
      includeSelectedCrmClientId: false,
      signal,
    }
  );
  const response = parseAnalyticsPowerBiAccessDto(
    rawResponse
  );

  return mapAnalyticsPowerBiOptionAccess(
    response,
    normalizedOptionIds
  );
}

export async function getAnalyticsPowerBiViewerContext(
  optionId: number,
  client: AnalyticsReportClientOption | null,
  signal?: AbortSignal
): Promise<AnalyticsPowerBiViewerContext> {
  assertPositiveInteger('optionId', optionId);

  let normalizedClient: AnalyticsReportClientOption | null;

  try {
    normalizedClient = normalizeReportClientInput(client);
  } catch {
    throw new Error(
      'La selección de cartera no es válida.'
    );
  }

  const query = new URLSearchParams();

  if (normalizedClient) {
    query.set('clientId', String(normalizedClient.clientId));
    query.set('reportClient', normalizedClient.name);
  }

  const suffix = query.size > 0
    ? `?${query.toString()}`
    : '';
  const rawResponse = await analyticsApiClient.get<unknown>(
    `/api/v1/analytics-access/user/options/${optionId}/power-bi-viewer-context${suffix}`,
    {
      includeSelectedCrmClientId: false,
      signal,
    }
  );
  const response = parseAnalyticsPowerBiViewerContextDto(
    rawResponse
  );

  if (response.optionId !== optionId) {
    throw new Error(
      'La respuesta de Analytics no corresponde al reporte solicitado.'
    );
  }

  return mapAnalyticsPowerBiViewerContext(response);
}

export async function getAnalyticsReportClients(
  optionId: number,
  signal?: AbortSignal
): Promise<AnalyticsReportClientOption[]> {
  assertPositiveInteger('optionId', optionId);

  const rawResponse = await analyticsApiClient.get<unknown>(
    `/api/v1/analytics-access/user/options/${optionId}/report-clients`,
    {
      includeSelectedCrmClientId: false,
      signal,
    }
  );
  const response = parseAnalyticsReportClientsDto(
    rawResponse
  );

  if (response.optionId !== optionId) {
    throw new Error(
      'La respuesta de Analytics no corresponde al reporte solicitado.'
    );
  }

  return mapAnalyticsReportClients(response);
}

const getAnalyticsUserOptionClients = async (
  optionId: number,
  signal?: AbortSignal
): Promise<AnalyticsScope[]> => {
  assertPositiveInteger('optionId', optionId);

  try {
    const rawResponse = await analyticsApiClient.get<unknown>(
      `/api/v1/analytics-access/user/options/${optionId}/clients`,
      {
        includeSelectedCrmClientId: false,
        signal,
      }
    );
    const response = parseAnalyticsOptionClientsDto(
      rawResponse
    );

    if (
      response.optionId !== undefined &&
      response.optionId !== optionId
    ) {
      throw new Error(
        'La respuesta de Analytics no corresponde a la opción solicitada.'
      );
    }

    return mapAnalyticsOptionClientsToScopes(response);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      return [];
    }

    throw error;
  }
};

export async function getAnalyticsAccess(
  optionId: number,
  signal?: AbortSignal
): Promise<AnalyticsAccessContext> {
  const scopes = await getAnalyticsUserOptionClients(
    optionId,
    signal
  );

  return { scopes };
}
