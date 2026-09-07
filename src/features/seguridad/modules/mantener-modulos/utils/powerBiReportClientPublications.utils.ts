import type {
  AnalyticsOptionReportClientPublication,
  AnalyticsReportClientPublicationInput,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

export const buildReportClientPublicationKey = (
  clientId: number,
  name: string
): string =>
  `${clientId}:${name.trim().toLocaleLowerCase('es-PE')}`;

export const buildReportClientPublicationIndex = (
  publications: readonly AnalyticsOptionReportClientPublication[]
): ReadonlyMap<
  string,
  AnalyticsOptionReportClientPublication
> =>
  new Map(
    publications.map((publication) => [
      buildReportClientPublicationKey(
        publication.clientId,
        publication.name
      ),
      publication,
    ])
  );

export const mergeReportClientPublicationDrafts = (
  configured: readonly AnalyticsOptionReportClientPublication[],
  drafts: ReadonlyMap<
    string,
    AnalyticsOptionReportClientPublication
  >
): AnalyticsOptionReportClientPublication[] =>
  configured.map((publication) =>
    drafts.get(
      buildReportClientPublicationKey(
        publication.clientId,
        publication.name
      )
    ) ?? publication
  );

const serializeGroupIds = (
  groupIds: readonly number[]
): string =>
  [...groupIds]
    .sort((left, right) => left - right)
    .join(',');

export const serializeReportClientPublications = (
  publications: readonly AnalyticsOptionReportClientPublication[]
): string =>
  publications
    .map((publication) => ({
      clientId: publication.clientId,
      name: publication.name.trim(),
      groupIds: serializeGroupIds(
        publication.groupIds
      ),
      embedUrl:
        publication.embedUrl?.trim() ?? '',
    }))
    .sort(
      (left, right) =>
        left.name.localeCompare(
          right.name,
          'es-PE',
          { sensitivity: 'base' }
        ) ||
        left.clientId - right.clientId
    )
    .map(
      (publication) =>
        `${publication.clientId}:${publication.name}:${publication.groupIds}:${publication.embedUrl}`
    )
    .join('\n');

export const getChangedReportClientPublications = (
  current: readonly AnalyticsOptionReportClientPublication[],
  configured: readonly AnalyticsOptionReportClientPublication[]
): AnalyticsReportClientPublicationInput[] => {
  const configuredByKey = new Map(
    configured.map((publication) => [
      buildReportClientPublicationKey(
        publication.clientId,
        publication.name
      ),
      publication,
    ])
  );

  return current
    .filter((publication) => publication.isAvailable)
    .flatMap((publication) => {
      const configuredPublication =
        configuredByKey.get(
          buildReportClientPublicationKey(
            publication.clientId,
            publication.name
          )
        );

      if (!configuredPublication) {
        return [{
          clientId: publication.clientId,
          name: publication.name.trim(),
          groupIds: publication.groupIds,
          embedUrl:
            publication.embedUrl?.trim() ?? '',
        }];
      }

      const embedChanged =
        publication.embedUrl?.trim() !==
        configuredPublication.embedUrl?.trim();
      const groupsChanged =
        serializeGroupIds(publication.groupIds) !==
        serializeGroupIds(
          configuredPublication.groupIds
        );

      if (!embedChanged && !groupsChanged) {
        return [];
      }

      return [{
        clientId: publication.clientId,
        name: publication.name.trim(),
        // null means "preserve the current group-resolution mode". This is
        // critical for AUTO_DETECTED rows: editing only the URL must not
        // convert the detected group into an explicit persisted scope.
        groupIds: groupsChanged
          ? publication.groupIds
          : null,
        embedUrl:
          publication.embedUrl?.trim() ?? '',
      }];
    });
};
