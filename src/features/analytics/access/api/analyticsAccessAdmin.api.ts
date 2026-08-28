import {
  ApiError,
} from '@shared/api/apiClient';

import {
  analyticsApiClient,
} from '@shared/api/analyticsApiClient';

export interface AnalyticsOptionClientsResponse {
  optionId: number;
  clientIds: number[];
}

export interface AnalyticsOptionGroupsResponse {
  optionId: number;
  groupIds: number[];
}

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

export interface AnalyticsOptionReportClientEmbedsResponse {
  optionId: number;
  clients: AnalyticsOptionReportClientPublication[];
}

export interface AnalyticsReportClientPublicationInput {
  clientId: number;
  name: string;
  groupIds: readonly number[];
  embedUrl: string;
}

interface SyncAnalyticsOptionInput {
  optionId: number;
  optionCode: string;
  optionName: string;
  isActive: boolean;
  groupIds: readonly number[];
}

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

export const getAnalyticsOptionClients =
  async (
    optionId: number,
    signal?: AbortSignal
  ): Promise<AnalyticsOptionClientsResponse> => {
    try {
      return await analyticsApiClient.get<
        AnalyticsOptionClientsResponse
      >(
        `/api/v1/analytics-access/options/${optionId}/clients`,
        {
          includeSelectedCrmClientId:
            false,
          signal,
        }
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        return {
          optionId,
          clientIds: [],
        };
      }

      throw error;
    }
  };

export const getAnalyticsOptionGroups =
  async (
    optionId: number,
    signal?: AbortSignal
  ): Promise<AnalyticsOptionGroupsResponse> => {
    try {
      return await analyticsApiClient.get<
        AnalyticsOptionGroupsResponse
      >(
        `/api/v1/analytics-access/options/${optionId}/groups`,
        {
          includeSelectedCrmClientId:
            false,
          signal,
        }
      );
    } catch (error) {
      /*
       * Un BI histórico puede existir solamente en SISGES.
       * Al editarlo se permite completar su scope de grupo.
       */
      if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        return {
          optionId,
          groupIds: [],
        };
      }

      throw error;
    }
  };

export const upsertAnalyticsOption =
  async ({
    optionId,
    optionCode,
    optionName,
    isActive,
  }: Omit<
    SyncAnalyticsOptionInput,
    'groupIds'
  >): Promise<void> => {
    await analyticsApiClient.put<void>(
      `/api/v1/analytics-access/options/${optionId}`,
      {
        optionCode:
          optionCode.trim(),
        optionName:
          optionName.trim(),
        isActive,
      },
      {
        includeSelectedCrmClientId:
          false,
      }
    );
  };

export const replaceAnalyticsOptionClients =
  async (
    optionId: number,
    clientIds: readonly number[]
  ): Promise<void> => {
    await analyticsApiClient.put<void>(
      `/api/v1/analytics-access/options/${optionId}/clients`,
      {
        clientIds:
          normalizePositiveIds(
            clientIds
          ),
      },
      {
        includeSelectedCrmClientId:
          false,
      }
    );
  };

export const replaceAnalyticsOptionGroups =
  async (
    optionId: number,
    groupIds: readonly number[]
  ): Promise<void> => {
    await analyticsApiClient.put<void>(
      `/api/v1/analytics-access/options/${optionId}/groups`,
      {
        groupIds:
          normalizePositiveIds(
            groupIds
          ),
      },
      {
        includeSelectedCrmClientId:
          false,
      }
    );
  };



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

export const getAnalyticsOptionReportClientEmbeds =
  async (
    optionId: number,
    signal?: AbortSignal
  ): Promise<AnalyticsOptionReportClientEmbedsResponse> => {
    try {
      const response =
        await analyticsApiClient.get<
          AnalyticsOptionReportClientEmbedsResponse
        >(
          `/api/v1/analytics-access/options/${optionId}/report-client-embeds`,
          {
            includeSelectedCrmClientId:
              false,
            signal,
          }
        );

      const uniqueClients = new Map<
        string,
        AnalyticsOptionReportClientPublication
      >();

      for (const client of response.clients ?? []) {
        const name = client.name?.trim();

        if (
          !Number.isSafeInteger(client.clientId) ||
          client.clientId <= 0 ||
          !name
        ) {
          continue;
        }

        const candidateGroups = new Map<
          number,
          AnalyticsReportClientGroupOption
        >();

        for (const group of client.candidateGroups ?? []) {
          const groupId = Number(group.groupId);
          const groupName = group.name?.trim();

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

        const groupIds = normalizePositiveIds(
          client.groupIds ?? []
        ).filter((groupId) =>
          candidateGroupIds.has(groupId)
        );

        const key =
          `${client.clientId}:${name.toLocaleLowerCase('es-PE')}`;

        if (!uniqueClients.has(key)) {
          uniqueClients.set(key, {
            clientId: client.clientId,
            name,
            isAvailable:
              client.isAvailable === true,
            groupResolution:
              normalizeReportClientGroupResolution(
                client.groupResolution
              ),
            hasExplicitGroupConfiguration:
              client.hasExplicitGroupConfiguration === true,
            groupIds,
            candidateGroups:
              normalizedCandidateGroups,
            embedUrl:
              client.embedUrl?.trim() || null,
            isReady:
              client.isReady === true,
          });
        }
      }

      return {
        optionId,
        clients: [...uniqueClients.values()].sort(
          (left, right) =>
            Number(right.isAvailable) -
              Number(left.isAvailable) ||
            left.name.localeCompare(
              right.name,
              'es-PE',
              { sensitivity: 'base' }
            ) ||
            left.clientId - right.clientId
        ),
      };
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        return {
          optionId,
          clients: [],
        };
      }

      throw error;
    }
  };

export const replaceAnalyticsOptionReportClientEmbeds =
  async (
    optionId: number,
    publications: readonly AnalyticsReportClientPublicationInput[]
  ): Promise<void> => {
    await analyticsApiClient.put<void>(
      `/api/v1/analytics-access/options/${optionId}/report-client-embeds`,
      {
        publications: publications.map(
          (publication) => ({
            clientId: publication.clientId,
            name: publication.name.trim(),
            groupIds: normalizePositiveIds(
              publication.groupIds
            ),
            embedUrl: publication.embedUrl.trim(),
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
  ): Promise<void> => {
    const groupIds =
      normalizePositiveIds(
        input.groupIds
      );

    if (groupIds.length === 0) {
      throw new Error(
        'El tablero Power BI debe tener al menos un grupo asociado.'
      );
    }

    await upsertAnalyticsOption(
      input
    );

    await replaceAnalyticsOptionGroups(
      input.optionId,
      groupIds
    );
  };
