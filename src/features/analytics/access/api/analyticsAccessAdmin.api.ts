import {
  analyticsApiClient,
} from '@shared/api/analyticsApiClient';

export type AnalyticsReportClientGroupResolution =
  | 'CONFIGURED'
  | 'AUTO_DETECTED'
  | 'AMBIGUOUS'
  | 'MISSING'
  | 'INVALID_CONFIGURED'
  | 'UNAVAILABLE';

export interface AnalyticsReportClientGroupOption {
  groupId: number;
  name: string;
}

export interface AnalyticsOptionReportClientPublication {
  clientId: number;
  name: string;
  isAvailable: boolean;
  groupResolution: AnalyticsReportClientGroupResolution;
  hasExplicitGroupConfiguration: boolean;
  groupIds: number[];
  candidateGroups: AnalyticsReportClientGroupOption[];
  embedUrl: string | null;
  isReady: boolean;
}

export interface AnalyticsReportClientPublicationInput {
  clientId: number;
  name: string;
  /** null preserves the current backend group-resolution mode. */
  groupIds: readonly number[] | null;
  embedUrl: string;
}

export interface AnalyticsPowerBiConfigurationGroup {
  groupId: number;
  clientId: number;
  name: string;
}

export interface AnalyticsPowerBiConfigurationResponse {
  optionId: number;
  isConfigured: boolean;
  groupIds: number[];
  availableGroups: AnalyticsPowerBiConfigurationGroup[];
  clients: AnalyticsOptionReportClientPublication[];
}

interface SyncAnalyticsOptionInput {
  optionId: number;
  optionCode: string;
  optionName: string;
  isActive: boolean;
  groupIds: readonly number[];
}

export interface SyncAnalyticsPowerBiConfigurationInput
  extends SyncAnalyticsOptionInput {
  publications?: readonly AnalyticsReportClientPublicationInput[];
}


const assertPositiveInteger = (
  name: string,
  value: number
): void => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
};

const normalizeRequiredText = (
  name: string,
  value: string
): string => {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${name} no puede estar vacío.`);
  }

  return normalized;
};

const normalizePositiveIds = (
  ids: readonly number[]
): number[] =>
  [...new Set(ids)]
    .filter(
      (id) =>
        Number.isSafeInteger(id) &&
        id > 0
    )
    .sort((a, b) => a - b);

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null;

const REPORT_CLIENT_GROUP_RESOLUTIONS = new Set<AnalyticsReportClientGroupResolution>([
  'CONFIGURED',
  'AUTO_DETECTED',
  'AMBIGUOUS',
  'MISSING',
  'INVALID_CONFIGURED',
  'UNAVAILABLE',
]);

const normalizeReportClientGroupResolution = (
  value: unknown
): AnalyticsReportClientGroupResolution =>
  typeof value === 'string' &&
  REPORT_CLIENT_GROUP_RESOLUTIONS.has(
    value as AnalyticsReportClientGroupResolution
  )
    ? value as AnalyticsReportClientGroupResolution
    : 'MISSING';

const normalizeReportClientPublications = (
  value: unknown
): AnalyticsOptionReportClientPublication[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueClients = new Map<
    string,
    AnalyticsOptionReportClientPublication
  >();

  for (const rawClient of value) {
    if (!isRecord(rawClient)) {
      continue;
    }

    const clientId = Number(
      rawClient.clientId
    );
    const name =
      typeof rawClient.name === 'string'
        ? rawClient.name.trim()
        : '';

    if (
      !Number.isSafeInteger(clientId) ||
      clientId <= 0 ||
      !name
    ) {
      continue;
    }

    const candidateGroups = new Map<
      number,
      AnalyticsReportClientGroupOption
    >();
    const rawCandidateGroups =
      Array.isArray(
        rawClient.candidateGroups
      )
        ? rawClient.candidateGroups
        : [];

    for (const rawGroup of rawCandidateGroups) {
      if (!isRecord(rawGroup)) {
        continue;
      }

      const groupId = Number(
        rawGroup.groupId
      );
      const groupName =
        typeof rawGroup.name === 'string'
          ? rawGroup.name.trim()
          : '';

      if (
        Number.isSafeInteger(groupId) &&
        groupId > 0 &&
        groupName
      ) {
        candidateGroups.set(groupId, {
          groupId,
          name: groupName,
        });
      }
    }

    const normalizedCandidateGroups =
      [...candidateGroups.values()].sort(
        (left, right) =>
          left.name.localeCompare(
            right.name,
            'es-PE',
            { sensitivity: 'base' }
          ) ||
          left.groupId - right.groupId
      );

    const candidateGroupIds = new Set(
      normalizedCandidateGroups.map(
        (group) => group.groupId
      )
    );

    const rawGroupIds =
      Array.isArray(rawClient.groupIds)
        ? rawClient.groupIds
            .map(Number)
            .filter(Number.isSafeInteger)
        : [];
    const groupIds = normalizePositiveIds(
      rawGroupIds
    ).filter((groupId) =>
      candidateGroupIds.has(groupId)
    );

    const key =
      `${clientId}:${name.toLocaleLowerCase('es-PE')}`;

    if (!uniqueClients.has(key)) {
      uniqueClients.set(key, {
        clientId,
        name,
        isAvailable:
          rawClient.isAvailable === true,
        groupResolution:
          normalizeReportClientGroupResolution(
            rawClient.groupResolution
          ),
        hasExplicitGroupConfiguration:
          rawClient.hasExplicitGroupConfiguration === true,
        groupIds,
        candidateGroups:
          normalizedCandidateGroups,
        embedUrl:
          typeof rawClient.embedUrl === 'string'
            ? rawClient.embedUrl.trim() || null
            : null,
        isReady:
          rawClient.isReady === true,
      });
    }
  }

  return [...uniqueClients.values()].sort(
    (left, right) =>
      Number(right.isAvailable) -
        Number(left.isAvailable) ||
      left.name.localeCompare(
        right.name,
        'es-PE',
        { sensitivity: 'base' }
      ) ||
      left.clientId - right.clientId
  );
};

export const getAnalyticsPowerBiConfiguration =
  async (
    optionId: number,
    signal?: AbortSignal
  ): Promise<AnalyticsPowerBiConfigurationResponse> => {
    assertPositiveInteger('optionId', optionId);

    const response =
      await analyticsApiClient.get<unknown>(
        `/api/v1/analytics-access/options/${optionId}/power-bi-configuration`,
        {
          includeSelectedCrmClientId:
            false,
          signal,
        }
      );

    if (!isRecord(response)) {
      throw new Error(
        'Analytics devolvió una configuración Power BI inválida.'
      );
    }

    const responseOptionId = Number(
      response.optionId
    );

    if (
      !Number.isSafeInteger(responseOptionId) ||
      responseOptionId !== optionId
    ) {
      throw new Error(
        'Analytics devolvió una configuración Power BI para una opción distinta.'
      );
    }

    const availableGroups = new Map<
      number,
      AnalyticsPowerBiConfigurationGroup
    >();
    const rawAvailableGroups =
      Array.isArray(response.availableGroups)
        ? response.availableGroups
        : [];

    for (const rawGroup of rawAvailableGroups) {
      if (!isRecord(rawGroup)) {
        continue;
      }

      const groupId = Number(
        rawGroup.groupId
      );
      const clientId = Number(
        rawGroup.clientId
      );
      const name =
        typeof rawGroup.name === 'string'
          ? rawGroup.name.trim()
          : '';

      if (
        Number.isSafeInteger(groupId) &&
        groupId > 0 &&
        Number.isSafeInteger(clientId) &&
        clientId > 0
      ) {
        availableGroups.set(groupId, {
          groupId,
          clientId,
          name,
        });
      }
    }

    const rawGroupIds =
      Array.isArray(response.groupIds)
        ? response.groupIds
            .map(Number)
            .filter(Number.isSafeInteger)
        : [];

    return {
      optionId,
      isConfigured:
        response.isConfigured === true,
      groupIds:
        normalizePositiveIds(
          rawGroupIds
        ),
      availableGroups:
        [...availableGroups.values()].sort(
          (left, right) =>
            left.name.localeCompare(
              right.name,
              'es-PE',
              { sensitivity: 'base' }
            ) ||
            left.groupId - right.groupId
        ),
      clients:
        normalizeReportClientPublications(
          response.clients
        ),
    };
  };

export const syncAnalyticsPowerBiConfiguration =
  async (
    input: SyncAnalyticsPowerBiConfigurationInput
  ): Promise<void> => {
    assertPositiveInteger('optionId', input.optionId);
    const optionCode = normalizeRequiredText(
      'optionCode',
      input.optionCode
    );
    const optionName = normalizeRequiredText(
      'optionName',
      input.optionName
    );
    const groupIds =
      normalizePositiveIds(
        input.groupIds
      );

    if (groupIds.length === 0) {
      throw new Error(
        'El tablero Power BI debe tener al menos un grupo asociado.'
      );
    }

    await analyticsApiClient.patch<void>(
      `/api/v1/analytics-access/options/${input.optionId}/power-bi-configuration`,
      {
        optionCode,
        optionName,
        isActive:
          input.isActive,
        groupIds,
        publications:
          (input.publications ?? []).map(
            (publication) => ({
              clientId:
                publication.clientId,
              name:
                publication.name.trim(),
              groupIds:
                publication.groupIds === null
                  ? null
                  : normalizePositiveIds(
                      publication.groupIds
                    ),
              embedUrl:
                publication.embedUrl.trim(),
            })
          ),
      },
      {
        includeSelectedCrmClientId:
          false,
      }
    );
  };

export const syncAnalyticsOption =
  async (
    input: SyncAnalyticsOptionInput
  ): Promise<void> =>
    syncAnalyticsPowerBiConfiguration(
      input
    );
