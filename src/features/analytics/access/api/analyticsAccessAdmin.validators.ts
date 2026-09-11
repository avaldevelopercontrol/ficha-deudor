import type {
  AnalyticsReportClientGroupResolution,
} from '../domain/analyticsAccessAdmin.types';
import type {
  AnalyticsOptionReportClientPublicationDto,
  AnalyticsPowerBiConfigurationDto,
  AnalyticsPowerBiConfigurationGroupDto,
  AnalyticsReportClientGroupOptionDto,
} from './analyticsAccessAdmin.dto';
import {
  expectAnalyticsArray,
  expectAnalyticsBoolean,
  expectAnalyticsEnum,
  expectAnalyticsNonEmptyString,
  expectAnalyticsNullableNonEmptyString,
  expectAnalyticsPositiveInteger,
  expectAnalyticsRecord,
} from './analyticsAccess.validation';

const REPORT_CLIENT_GROUP_RESOLUTIONS = new Set<AnalyticsReportClientGroupResolution>([
  'CONFIGURED',
  'AUTO_DETECTED',
  'AMBIGUOUS',
  'MISSING',
  'INVALID_CONFIGURED',
  'UNAVAILABLE',
]);

const parsePositiveIntegerArray = (
  value: unknown,
  contract: string,
  path: string
): number[] =>
  expectAnalyticsArray(value, contract, path).map(
    (item, index) =>
      expectAnalyticsPositiveInteger(
        item,
        contract,
        `${path}[${index}]`
      )
  );

const parseCandidateGroup = (
  value: unknown,
  contract: string,
  path: string
): AnalyticsReportClientGroupOptionDto => {
  const record = expectAnalyticsRecord(
    value,
    contract,
    path
  );

  return {
    groupId: expectAnalyticsPositiveInteger(
      record.groupId,
      contract,
      `${path}.groupId`
    ),
    name: expectAnalyticsNonEmptyString(
      record.name,
      contract,
      `${path}.name`
    ),
  };
};

const parseAvailableGroup = (
  value: unknown,
  contract: string,
  path: string
): AnalyticsPowerBiConfigurationGroupDto => {
  const record = expectAnalyticsRecord(
    value,
    contract,
    path
  );

  return {
    groupId: expectAnalyticsPositiveInteger(
      record.groupId,
      contract,
      `${path}.groupId`
    ),
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

const parsePublication = (
  value: unknown,
  contract: string,
  path: string
): AnalyticsOptionReportClientPublicationDto => {
  const record = expectAnalyticsRecord(
    value,
    contract,
    path
  );
  const candidateGroups = expectAnalyticsArray(
    record.candidateGroups,
    contract,
    `${path}.candidateGroups`
  ).map((group, index) =>
    parseCandidateGroup(
      group,
      contract,
      `${path}.candidateGroups[${index}]`
    )
  );
  const candidateGroupIds = new Set(
    candidateGroups.map((group) => group.groupId)
  );
  const groupIds = parsePositiveIntegerArray(
    record.groupIds,
    contract,
    `${path}.groupIds`
  );

  for (const groupId of groupIds) {
    if (!candidateGroupIds.has(groupId)) {
      throw new Error(
        `Analytics devolvió una configuración Power BI inconsistente: ${path}.groupIds contiene un grupo no disponible.`
      );
    }
  }

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
    isAvailable: expectAnalyticsBoolean(
      record.isAvailable,
      contract,
      `${path}.isAvailable`
    ),
    groupResolution: expectAnalyticsEnum<AnalyticsReportClientGroupResolution>(
      record.groupResolution,
      REPORT_CLIENT_GROUP_RESOLUTIONS,
      contract,
      `${path}.groupResolution`
    ),
    hasExplicitGroupConfiguration: expectAnalyticsBoolean(
      record.hasExplicitGroupConfiguration,
      contract,
      `${path}.hasExplicitGroupConfiguration`
    ),
    groupIds,
    candidateGroups,
    embedUrl: expectAnalyticsNullableNonEmptyString(
      record.embedUrl,
      contract,
      `${path}.embedUrl`
    ),
    isReady: expectAnalyticsBoolean(
      record.isReady,
      contract,
      `${path}.isReady`
    ),
  };
};

export const parseAnalyticsPowerBiConfigurationDto = (
  value: unknown
): AnalyticsPowerBiConfigurationDto => {
  const contract = 'AnalyticsPowerBiConfiguration';
  const record = expectAnalyticsRecord(
    value,
    contract,
    'response'
  );

  return {
    optionId: expectAnalyticsPositiveInteger(
      record.optionId,
      contract,
      'response.optionId'
    ),
    isConfigured: expectAnalyticsBoolean(
      record.isConfigured,
      contract,
      'response.isConfigured'
    ),
    groupIds: parsePositiveIntegerArray(
      record.groupIds,
      contract,
      'response.groupIds'
    ),
    availableGroups: expectAnalyticsArray(
      record.availableGroups,
      contract,
      'response.availableGroups'
    ).map((group, index) =>
      parseAvailableGroup(
        group,
        contract,
        `response.availableGroups[${index}]`
      )
    ),
    clients: expectAnalyticsArray(
      record.clients,
      contract,
      'response.clients'
    ).map((client, index) =>
      parsePublication(
        client,
        contract,
        `response.clients[${index}]`
      )
    ),
  };
};
