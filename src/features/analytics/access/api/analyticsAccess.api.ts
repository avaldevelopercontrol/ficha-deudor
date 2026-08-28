import { fetchClientesActivos } from '@features/seguridad/api/clientesApi';
import { analyticsApiClient } from '@shared/api/analyticsApiClient';
import { ApiError } from '@shared/api/apiClient';

import type {
  AnalyticsAccessContext,
  AnalyticsOptionClientsResponse,
  AnalyticsOptionGroupAccessResponse,
  AnalyticsReportClientEmbedResponse,
  AnalyticsReportClientOption,
  AnalyticsReportClientsResponse,
  AnalyticsScope,
} from '../types/analyticsAccess.types';

const isPositiveInteger = (
  value: number
): boolean =>
  Number.isSafeInteger(value) &&
  value > 0;

const buildScopes = (
  clientIds: readonly number[],
  clientNames: ReadonlyMap<number, string>
): AnalyticsScope[] =>
  [...new Set(clientIds)]
    .filter(isPositiveInteger)
    .sort((a, b) => a - b)
    .map((crmClientId) => ({
      crmClientId,
      name:
        clientNames.get(crmClientId) ??
        `Cartera ${crmClientId}`,
    }));

const getClientIds = async (
  optionId: number,
  endpoint: string
): Promise<number[]> => {
  if (!isPositiveInteger(optionId)) {
    throw new Error(
      'optionId debe ser un entero positivo.'
    );
  }

  let response: AnalyticsOptionClientsResponse;

  try {
    response =
      await analyticsApiClient.get<
        AnalyticsOptionClientsResponse
      >(
        endpoint,
        {
          includeSelectedCrmClientId: false,
        }
      );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      return [];
    }

    throw error;
  }

  return [...new Set(
    response.clientIds ?? []
  )]
    .filter(isPositiveInteger)
    .sort((a, b) => a - b);
};

export async function getAnalyticsOptionClientIds(
  optionId: number
): Promise<number[]> {
  return getClientIds(
    optionId,
    `/api/v1/analytics-access/user/options/${optionId}/client-scopes`
  );
}

export async function getAnalyticsOptionGroupAccess(
  optionId: number
): Promise<AnalyticsOptionGroupAccessResponse> {
  if (!isPositiveInteger(optionId)) {
    throw new Error(
      'optionId debe ser un entero positivo.'
    );
  }

  try {
    const response =
      await analyticsApiClient.get<
        AnalyticsOptionGroupAccessResponse
      >(
        `/api/v1/analytics-access/user/options/${optionId}/group-scopes`,
        {
          includeSelectedCrmClientId: false,
        }
      );

    return {
      optionId: response.optionId,
      allowed: response.allowed === true,
      scopeMode: response.scopeMode,
      groupIds: [...new Set(
        response.groupIds ?? []
      )]
        .filter(isPositiveInteger)
        .sort((a, b) => a - b),
      requiresClientSelection:
        response.requiresClientSelection === true,
    };
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      return {
        optionId,
        allowed: false,
        scopeMode: 'NONE',
        groupIds: [],
        requiresClientSelection: false,
      };
    }

    throw error;
  }
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

export async function getAnalyticsReportClientEmbed(
  optionId: number,
  client: AnalyticsReportClientOption,
  signal?: AbortSignal
): Promise<string | null> {
  if (
    !isPositiveInteger(optionId) ||
    !isPositiveInteger(client.clientId) ||
    !client.name.trim()
  ) {
    throw new Error(
      'La selección de cartera no es válida.'
    );
  }

  const query = new URLSearchParams({
    clientId: String(client.clientId),
    reportClient: client.name.trim(),
  });

  let response: AnalyticsReportClientEmbedResponse;

  try {
    response =
      await analyticsApiClient.get<
        AnalyticsReportClientEmbedResponse
      >(
        `/api/v1/analytics-access/user/options/${optionId}/report-client-embed?${query.toString()}`,
        {
          includeSelectedCrmClientId: false,
          signal,
        }
      );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      return null;
    }

    throw error;
  }

  const responseName = response.name?.trim();
  const requestedName = client.name.trim();

  if (
    response.optionId !== optionId ||
    response.clientId !== client.clientId ||
    !responseName ||
    responseName.localeCompare(
      requestedName,
      'es',
      { sensitivity: 'base' }
    ) !== 0
  ) {
    throw new Error(
      'La respuesta de Analytics no corresponde a la cartera solicitada.'
    );
  }

  const embedUrl = response.embedUrl?.trim();

  return embedUrl || null;
}

const getAnalyticsUserOptionClientIds = (
  optionId: number
): Promise<number[]> =>
  getClientIds(
    optionId,
    `/api/v1/analytics-access/user/options/${optionId}/clients`
  );

export async function getAnalyticsAccess(
  optionId: number
): Promise<AnalyticsAccessContext> {
  const clientIds =
    await getAnalyticsUserOptionClientIds(
      optionId
    );

  let clientNames =
    new Map<number, string>();

  try {
    const clientes =
      await fetchClientesActivos();

    clientNames = new Map(
      clientes.map((cliente) => [
        cliente.idCliente,
        cliente.nombreCliente,
      ])
    );
  } catch {
    /*
     * Resolver el nombre es complementario.
     * La autorización siempre la define analytics-api.
     */
  }

  return {
    scopes: buildScopes(
      clientIds,
      clientNames
    ),
    reports: [],
  };
}
