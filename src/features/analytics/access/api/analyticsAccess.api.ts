import { analyticsApiClient } from '@shared/api/analyticsApiClient';
import { ApiError } from '@shared/api/apiClient';

import type {
  AnalyticsAccessContext,
  AnalyticsOptionClientsResponse,
  AnalyticsPowerBiAccessResponse,
  AnalyticsPowerBiClientSelectionStatus,
  AnalyticsPowerBiOptionAccess,
  AnalyticsPowerBiViewerContextResponse,
  AnalyticsReportClientOption,
  AnalyticsReportClientsResponse,
  AnalyticsScope,
} from '../types/analyticsAccess.types';

const isPositiveInteger = (
  value: number
): boolean =>
  Number.isSafeInteger(value) &&
  value > 0;

const normalizeOptionClients = (
  optionId: number,
  response: AnalyticsOptionClientsResponse
): AnalyticsScope[] => {
  if (
    response.optionId !== undefined &&
    response.optionId !== optionId
  ) {
    throw new Error(
      'La respuesta de Analytics no corresponde a la opción solicitada.'
    );
  }

  const scopesById = new Map<number, AnalyticsScope>();

  for (const client of response.clients ?? []) {
    const crmClientId = Number(client?.clientId);
    const name = client?.name?.trim();

    if (!isPositiveInteger(crmClientId) || !name) {
      continue;
    }

    scopesById.set(crmClientId, {
      crmClientId,
      name,
    });
  }

  // Compatibilidad de despliegue: durante un rolling deploy, una instancia
  // anterior del backend puede responder todavía solo clientIds. La
  // autorización sigue viniendo del mismo endpoint y nunca se consulta la API
  // legacy de clientes desde el navegador.
  for (const clientId of response.clientIds ?? []) {
    const crmClientId = Number(clientId);

    if (
      isPositiveInteger(crmClientId) &&
      !scopesById.has(crmClientId)
    ) {
      scopesById.set(crmClientId, {
        crmClientId,
        name: `Cartera ${crmClientId}`,
      });
    }
  }

  return [...scopesById.values()].sort(
    (a, b) => a.crmClientId - b.crmClientId
  );
};

const POWER_BI_CLIENT_SELECTION_STATUSES = new Set<
  AnalyticsPowerBiClientSelectionStatus
>([
  'NOT_REQUIRED',
  'VALID',
  'MISSING',
  'INVALID',
]);

const normalizeReportClient = (
  client: AnalyticsReportClientOption | null | undefined
): AnalyticsReportClientOption | null => {
  const name = client?.name?.trim();

  if (
    !client ||
    !isPositiveInteger(client.clientId) ||
    !name
  ) {
    return null;
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
    .sort((a, b) => a - b);

  if (normalizedOptionIds.length === 0) {
    return [];
  }

  const query = new URLSearchParams({
    optionIds: normalizedOptionIds.join(','),
  });

  const response =
    await analyticsApiClient.get<
      AnalyticsPowerBiAccessResponse
    >(
      `/api/v1/analytics-access/user/power-bi-access?${query.toString()}`,
      {
        includeSelectedCrmClientId: false,
        signal,
      }
    );

  if (!Array.isArray(response.options)) {
    throw new Error(
      'La respuesta de Analytics para los reportes Power BI no es válida.'
    );
  }

  const requestedOptionIds = new Set(
    normalizedOptionIds
  );
  const uniqueAccess = new Map<
    number,
    AnalyticsPowerBiOptionAccess
  >();

  for (const option of response.options) {
    if (
      !isPositiveInteger(option.optionId) ||
      !requestedOptionIds.has(option.optionId) ||
      uniqueAccess.has(option.optionId)
    ) {
      throw new Error(
        'La respuesta de Analytics no corresponde a los reportes solicitados.'
      );
    }

    uniqueAccess.set(option.optionId, {
      optionId: option.optionId,
      allowed: option.allowed === true,
      requiresClientSelection:
        option.allowed === true &&
        option.requiresClientSelection === true,
    });
  }

  if (
    normalizedOptionIds.some(
      (optionId) => !uniqueAccess.has(optionId)
    )
  ) {
    throw new Error(
      'La respuesta de Analytics está incompleta para los reportes solicitados.'
    );
  }

  return normalizedOptionIds.map(
    (optionId) => uniqueAccess.get(optionId)!
  );
}

export async function getAnalyticsPowerBiViewerContext(
  optionId: number,
  client: AnalyticsReportClientOption | null,
  signal?: AbortSignal
): Promise<AnalyticsPowerBiViewerContextResponse> {
  if (!isPositiveInteger(optionId)) {
    throw new Error(
      'optionId debe ser un entero positivo.'
    );
  }

  const normalizedClient = normalizeReportClient(client);

  if (client !== null && normalizedClient === null) {
    throw new Error(
      'La selección de cartera no es válida.'
    );
  }

  const query = new URLSearchParams();

  if (normalizedClient) {
    query.set(
      'clientId',
      String(normalizedClient.clientId)
    );
    query.set(
      'reportClient',
      normalizedClient.name
    );
  }

  const suffix = query.size > 0
    ? `?${query.toString()}`
    : '';

  const response =
    await analyticsApiClient.get<
      AnalyticsPowerBiViewerContextResponse
    >(
      `/api/v1/analytics-access/user/options/${optionId}/power-bi-viewer-context${suffix}`,
      {
        includeSelectedCrmClientId: false,
        signal,
      }
    );

  if (
    response.optionId !== optionId ||
    !POWER_BI_CLIENT_SELECTION_STATUSES.has(
      response.clientSelectionStatus
    )
  ) {
    throw new Error(
      'La respuesta de Analytics no corresponde al reporte solicitado.'
    );
  }

  const allowed = response.allowed === true;
  const requiresClientSelection =
    allowed &&
    response.requiresClientSelection === true;
  const selectedClient = normalizeReportClient(
    response.selectedClient
  );
  const embedUrl = response.embedUrl?.trim() || null;

  if (
    (!allowed &&
      (requiresClientSelection ||
        response.clientSelectionStatus !==
          'NOT_REQUIRED')) ||
    (response.clientSelectionStatus ===
      'NOT_REQUIRED' &&
      requiresClientSelection) ||
    (response.clientSelectionStatus !==
      'NOT_REQUIRED' &&
      !requiresClientSelection) ||
    (response.clientSelectionStatus === 'VALID' &&
      (!selectedClient || !embedUrl)) ||
    (response.clientSelectionStatus !== 'VALID' &&
      (selectedClient !== null || embedUrl !== null))
  ) {
    throw new Error(
      'La respuesta de Analytics contiene un contexto Power BI inconsistente.'
    );
  }

  return {
    optionId,
    allowed,
    requiresClientSelection,
    clientSelectionStatus:
      response.clientSelectionStatus,
    selectedClient,
    embedUrl,
  };
}

export async function getAnalyticsReportClients(
  optionId: number,
  signal?: AbortSignal
): Promise<AnalyticsReportClientOption[]> {
  if (!isPositiveInteger(optionId)) {
    throw new Error(
      'optionId debe ser un entero positivo.'
    );
  }

  const response =
    await analyticsApiClient.get<
      AnalyticsReportClientsResponse
    >(
      `/api/v1/analytics-access/user/options/${optionId}/report-clients`,
      {
        includeSelectedCrmClientId: false,
        signal,
      }
    );

  if (response.optionId !== optionId) {
    throw new Error(
      'La respuesta de Analytics no corresponde al reporte solicitado.'
    );
  }

  const uniqueClients = new Map<
    string,
    AnalyticsReportClientOption
  >();

  for (const client of response.clients ?? []) {
    const name = client.name?.trim();

    if (
      !isPositiveInteger(client.clientId) ||
      !name
    ) {
      continue;
    }

    const key = `${client.clientId}:${name.toLocaleLowerCase()}`;

    if (!uniqueClients.has(key)) {
      uniqueClients.set(key, {
        clientId: client.clientId,
        name,
      });
    }
  }

  return [...uniqueClients.values()].sort(
    (left, right) =>
      left.name.localeCompare(
        right.name,
        'es',
        { sensitivity: 'base' }
      ) ||
      left.clientId - right.clientId
  );
}

const getAnalyticsUserOptionClients = async (
  optionId: number,
  signal?: AbortSignal
): Promise<AnalyticsScope[]> => {
  if (!isPositiveInteger(optionId)) {
    throw new Error(
      'optionId debe ser un entero positivo.'
    );
  }

  try {
    const response =
      await analyticsApiClient.get<AnalyticsOptionClientsResponse>(
        `/api/v1/analytics-access/user/options/${optionId}/clients`,
        {
          includeSelectedCrmClientId: false,
          signal,
        }
      );

    return normalizeOptionClients(optionId, response);
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
