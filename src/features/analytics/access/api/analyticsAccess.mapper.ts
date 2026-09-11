import type {
  AnalyticsPowerBiOptionAccess,
  AnalyticsPowerBiViewerContext,
  AnalyticsReportClientOption,
  AnalyticsScope,
} from '../domain/analyticsAccess.types';
import type {
  AnalyticsOptionClientsDto,
  AnalyticsPowerBiAccessDto,
  AnalyticsPowerBiViewerContextDto,
  AnalyticsReportClientsDto,
} from './analyticsAccess.dto';

export const mapAnalyticsOptionClientsToScopes = (
  response: AnalyticsOptionClientsDto
): AnalyticsScope[] => {
  const scopesById = new Map<number, AnalyticsScope>();

  for (const client of response.clients ?? []) {
    scopesById.set(client.clientId, {
      crmClientId: client.clientId,
      name: client.name.trim(),
    });
  }

  // Compatibilidad de despliegue: durante un rolling deploy, una instancia
  // anterior del backend puede responder todavía solo clientIds. La
  // autorización sigue viniendo del mismo endpoint y nunca se consulta la API
  // legacy de clientes desde el navegador.
  for (const clientId of response.clientIds ?? []) {
    if (!scopesById.has(clientId)) {
      scopesById.set(clientId, {
        crmClientId: clientId,
        name: `Cartera ${clientId}`,
      });
    }
  }

  return [...scopesById.values()].sort(
    (left, right) => left.crmClientId - right.crmClientId
  );
};

export const mapAnalyticsPowerBiOptionAccess = (
  response: AnalyticsPowerBiAccessDto,
  normalizedOptionIds: readonly number[]
): AnalyticsPowerBiOptionAccess[] => {
  const requestedOptionIds = new Set(normalizedOptionIds);
  const uniqueAccess = new Map<number, AnalyticsPowerBiOptionAccess>();

  for (const option of response.options) {
    if (
      !requestedOptionIds.has(option.optionId) ||
      uniqueAccess.has(option.optionId)
    ) {
      throw new Error(
        'La respuesta de Analytics no corresponde a los reportes solicitados.'
      );
    }

    uniqueAccess.set(option.optionId, {
      optionId: option.optionId,
      allowed: option.allowed,
      requiresClientSelection:
        option.allowed && option.requiresClientSelection,
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
};

const mapReportClient = (
  client: {
    clientId: number;
    name: string;
  }
): AnalyticsReportClientOption => ({
  clientId: client.clientId,
  name: client.name.trim(),
});

export const mapAnalyticsPowerBiViewerContext = (
  response: AnalyticsPowerBiViewerContextDto
): AnalyticsPowerBiViewerContext => {
  const selectedClient = response.selectedClient
    ? mapReportClient(response.selectedClient)
    : null;
  const embedUrl = response.embedUrl?.trim() ?? null;
  const {
    allowed,
    requiresClientSelection,
    clientSelectionStatus,
  } = response;

  if (
    (!allowed &&
      (requiresClientSelection ||
        clientSelectionStatus !== 'NOT_REQUIRED')) ||
    (clientSelectionStatus === 'NOT_REQUIRED' &&
      requiresClientSelection) ||
    (clientSelectionStatus !== 'NOT_REQUIRED' &&
      !requiresClientSelection) ||
    (clientSelectionStatus === 'VALID' &&
      (!selectedClient || !embedUrl)) ||
    (clientSelectionStatus !== 'VALID' &&
      (selectedClient !== null || embedUrl !== null))
  ) {
    throw new Error(
      'La respuesta de Analytics contiene un contexto Power BI inconsistente.'
    );
  }

  return {
    optionId: response.optionId,
    allowed,
    requiresClientSelection,
    clientSelectionStatus,
    selectedClient,
    embedUrl,
  };
};

export const mapAnalyticsReportClients = (
  response: AnalyticsReportClientsDto
): AnalyticsReportClientOption[] => {
  const uniqueClients = new Map<string, AnalyticsReportClientOption>();

  for (const client of response.clients) {
    const normalized = mapReportClient(client);
    const key = `${normalized.clientId}:${normalized.name.toLocaleLowerCase('es-PE')}`;

    if (!uniqueClients.has(key)) {
      uniqueClients.set(key, normalized);
    }
  }

  return [...uniqueClients.values()].sort(
    (left, right) =>
      left.name.localeCompare(right.name, 'es-PE', {
        sensitivity: 'base',
      }) || left.clientId - right.clientId
  );
};
