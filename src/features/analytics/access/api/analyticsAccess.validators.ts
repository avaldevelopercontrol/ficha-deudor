import type {
  AnalyticsPowerBiClientSelectionStatus,
} from '../domain/analyticsAccess.types';
import type {
  AnalyticsOptionClientDto,
  AnalyticsOptionClientsDto,
  AnalyticsPowerBiAccessDto,
  AnalyticsPowerBiOptionAccessDto,
  AnalyticsPowerBiViewerContextDto,
  AnalyticsReportClientDto,
  AnalyticsReportClientsDto,
} from './analyticsAccess.dto';
import {
  expectAnalyticsArray,
  expectAnalyticsBoolean,
  expectAnalyticsEnum,
  expectAnalyticsNonEmptyString,
  expectAnalyticsNullableNonEmptyString,
  expectAnalyticsNullableRecord,
  expectAnalyticsOptionalArray,
  expectAnalyticsOptionalPositiveInteger,
  expectAnalyticsPositiveInteger,
  expectAnalyticsRecord,
} from './analyticsAccess.validation';

const POWER_BI_CLIENT_SELECTION_STATUSES = new Set<
  AnalyticsPowerBiClientSelectionStatus
>([
  'NOT_REQUIRED',
  'VALID',
  'MISSING',
  'INVALID',
]);

const parseReportClient = (
  value: unknown,
  contract: string,
  path: string
): AnalyticsReportClientDto => {
  const record = expectAnalyticsRecord(
    value,
    contract,
    path
  );

  return {
    clientId: expectAnalyticsPositiveInteger(
      record.clientId,
      contract,
      `${path}.clientId`
    ),
    name: expectAnalyticsNonEmptyString(
      record.name,
      contract,
      `${path}.name`
    ),
  };
};

export const parseAnalyticsOptionClientsDto = (
  value: unknown
): AnalyticsOptionClientsDto => {
  const contract = 'AnalyticsOptionClients';
  const record = expectAnalyticsRecord(
    value,
    contract,
    'response'
  );
  const rawClients = expectAnalyticsOptionalArray(
    record.clients,
    contract,
    'response.clients'
  );
  const rawClientIds = expectAnalyticsOptionalArray(
    record.clientIds,
    contract,
    'response.clientIds'
  );

  return {
    optionId: expectAnalyticsOptionalPositiveInteger(
      record.optionId,
      contract,
      'response.optionId'
    ),
    clients: rawClients?.map(
      (client, index): AnalyticsOptionClientDto =>
        parseReportClient(
          client,
          contract,
          `response.clients[${index}]`
        )
    ),
    clientIds: rawClientIds?.map(
      (clientId, index) =>
        expectAnalyticsPositiveInteger(
          clientId,
          contract,
          `response.clientIds[${index}]`
        )
    ),
  };
};

export const parseAnalyticsPowerBiAccessDto = (
  value: unknown
): AnalyticsPowerBiAccessDto => {
  const contract = 'AnalyticsPowerBiAccess';
  const record = expectAnalyticsRecord(
    value,
    contract,
    'response'
  );
  const rawOptions = expectAnalyticsArray(
    record.options,
    contract,
    'response.options'
  );

  return {
    options: rawOptions.map(
      (option, index): AnalyticsPowerBiOptionAccessDto => {
        const rawOption = expectAnalyticsRecord(
          option,
          contract,
          `response.options[${index}]`
        );

        return {
          optionId: expectAnalyticsPositiveInteger(
            rawOption.optionId,
            contract,
            `response.options[${index}].optionId`
          ),
          allowed: expectAnalyticsBoolean(
            rawOption.allowed,
            contract,
            `response.options[${index}].allowed`
          ),
          requiresClientSelection: expectAnalyticsBoolean(
            rawOption.requiresClientSelection,
            contract,
            `response.options[${index}].requiresClientSelection`
          ),
        };
      }
    ),
  };
};

export const parseAnalyticsPowerBiViewerContextDto = (
  value: unknown
): AnalyticsPowerBiViewerContextDto => {
  const contract = 'AnalyticsPowerBiViewerContext';
  const record = expectAnalyticsRecord(
    value,
    contract,
    'response'
  );
  const rawSelectedClient = expectAnalyticsNullableRecord(
    record.selectedClient,
    contract,
    'response.selectedClient'
  );

  return {
    optionId: expectAnalyticsPositiveInteger(
      record.optionId,
      contract,
      'response.optionId'
    ),
    allowed: expectAnalyticsBoolean(
      record.allowed,
      contract,
      'response.allowed'
    ),
    requiresClientSelection: expectAnalyticsBoolean(
      record.requiresClientSelection,
      contract,
      'response.requiresClientSelection'
    ),
    clientSelectionStatus: expectAnalyticsEnum<AnalyticsPowerBiClientSelectionStatus>(
      record.clientSelectionStatus,
      POWER_BI_CLIENT_SELECTION_STATUSES,
      contract,
      'response.clientSelectionStatus'
    ),
    selectedClient:
      rawSelectedClient === null
        ? null
        : parseReportClient(
            rawSelectedClient,
            contract,
            'response.selectedClient'
          ),
    embedUrl: expectAnalyticsNullableNonEmptyString(
      record.embedUrl,
      contract,
      'response.embedUrl'
    ),
  };
};

export const parseAnalyticsReportClientsDto = (
  value: unknown
): AnalyticsReportClientsDto => {
  const contract = 'AnalyticsReportClients';
  const record = expectAnalyticsRecord(
    value,
    contract,
    'response'
  );
  const rawClients = expectAnalyticsArray(
    record.clients,
    contract,
    'response.clients'
  );

  return {
    optionId: expectAnalyticsPositiveInteger(
      record.optionId,
      contract,
      'response.optionId'
    ),
    clients: rawClients.map((client, index) =>
      parseReportClient(
        client,
        contract,
        `response.clients[${index}]`
      )
    ),
  };
};
