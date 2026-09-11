import type {
  AnalyticsOptionReportClientPublication,
  AnalyticsPowerBiConfiguration,
  AnalyticsPowerBiConfigurationGroup,
  AnalyticsReportClientGroupOption,
} from '../domain/analyticsAccessAdmin.types';
import type {
  AnalyticsOptionReportClientPublicationDto,
  AnalyticsPowerBiConfigurationDto,
} from './analyticsAccessAdmin.dto';

const uniqueSortedPositiveIds = (
  ids: readonly number[]
): number[] =>
  [...new Set(ids)].sort((left, right) => left - right);

const mapPublication = (
  publication: AnalyticsOptionReportClientPublicationDto
): AnalyticsOptionReportClientPublication => {
  const candidateGroupsById = new Map<
    number,
    AnalyticsReportClientGroupOption
  >();

  for (const group of publication.candidateGroups) {
    candidateGroupsById.set(group.groupId, {
      groupId: group.groupId,
      name: group.name.trim(),
    });
  }

  return {
    clientId: publication.clientId,
    name: publication.name.trim(),
    isAvailable: publication.isAvailable,
    groupResolution: publication.groupResolution,
    hasExplicitGroupConfiguration:
      publication.hasExplicitGroupConfiguration,
    groupIds: uniqueSortedPositiveIds(publication.groupIds),
    candidateGroups: [...candidateGroupsById.values()].sort(
      (left, right) =>
        left.name.localeCompare(right.name, 'es-PE', {
          sensitivity: 'base',
        }) || left.groupId - right.groupId
    ),
    embedUrl: publication.embedUrl?.trim() ?? null,
    isReady: publication.isReady,
  };
};

export const mapAnalyticsPowerBiConfiguration = (
  response: AnalyticsPowerBiConfigurationDto
): AnalyticsPowerBiConfiguration => {
  const availableGroupsById = new Map<
    number,
    AnalyticsPowerBiConfigurationGroup
  >();

  for (const group of response.availableGroups) {
    availableGroupsById.set(group.groupId, {
      groupId: group.groupId,
      clientId: group.clientId,
      name: group.name.trim(),
    });
  }

  const uniqueClients = new Map<
    string,
    AnalyticsOptionReportClientPublication
  >();

  for (const rawClient of response.clients) {
    const client = mapPublication(rawClient);
    const key = `${client.clientId}:${client.name.toLocaleLowerCase('es-PE')}`;

    if (!uniqueClients.has(key)) {
      uniqueClients.set(key, client);
    }
  }

  return {
    optionId: response.optionId,
    isConfigured: response.isConfigured,
    groupIds: uniqueSortedPositiveIds(response.groupIds),
    availableGroups: [...availableGroupsById.values()].sort(
      (left, right) =>
        left.name.localeCompare(right.name, 'es-PE', {
          sensitivity: 'base',
        }) || left.groupId - right.groupId
    ),
    clients: [...uniqueClients.values()].sort(
      (left, right) =>
        Number(right.isAvailable) - Number(left.isAvailable) ||
        left.name.localeCompare(right.name, 'es-PE', {
          sensitivity: 'base',
        }) || left.clientId - right.clientId
    ),
  };
};
