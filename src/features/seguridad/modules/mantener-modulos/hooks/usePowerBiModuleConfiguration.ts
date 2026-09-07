import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  getAnalyticsPowerBiConfiguration,
  type AnalyticsOptionReportClientPublication,
  type AnalyticsReportClientPublicationInput,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

import type {
  Grupo,
} from '@features/seguridad/types/grupo.types';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  isValidPowerBiPublishToWebUrl,
} from '../utils/powerBiModulo.utils';

import {
  buildReportClientPublicationIndex,
  buildReportClientPublicationKey,
  getChangedReportClientPublications,
  mergeReportClientPublicationDrafts,
  serializeReportClientPublications,
} from '../utils/powerBiReportClientPublications.utils';

interface UsePowerBiModuleConfigurationOptions {
  isOpen: boolean;
  moduloId: number;
  enabled: boolean;
}

interface UsePowerBiModuleConfigurationResult {
  groups: readonly Grupo[];
  selectedGroupIds: readonly number[];
  reportClientPublications: readonly AnalyticsOptionReportClientPublication[];
  hasReportClientConfiguration: boolean;
  hasInvalidReportClientPublication: boolean;
  hasValidGroupSelection: boolean;
  groupsDirty: boolean;
  reportClientPublicationsDirty: boolean;
  isLoading: boolean;
  error: string | null;
  groupSelectionError: string | null;
  refetch: () => Promise<void>;
  validateGroupSelection: () => string | null;
  getPublicationsForSave: () => AnalyticsReportClientPublicationInput[] | null;
  onGroupSelectionChange: (groupIds: number[]) => void;
  onEmbedUrlChange: (
    clientId: number,
    name: string,
    embedUrl: string
  ) => void;
  onReportClientGroupIdsChange: (
    clientId: number,
    name: string,
    groupIds: readonly number[]
  ) => void;
}

const GROUP_SELECTION_ERROR =
  'Seleccione un grupo para el tablero Power BI.';

export const usePowerBiModuleConfiguration = ({
  isOpen,
  moduloId,
  enabled,
}: UsePowerBiModuleConfigurationOptions): UsePowerBiModuleConfigurationResult => {
  const [
    editedGroupIds,
    setEditedGroupIds,
  ] = useState<number[] | null>(null);

  const [
    publicationDrafts,
    setPublicationDrafts,
  ] = useState<
    ReadonlyMap<
      string,
      AnalyticsOptionReportClientPublication
    >
  >(() => new Map());

  const [
    groupSelectionError,
    setGroupSelectionError,
  ] = useState<string | null>(null);

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      getAnalyticsPowerBiConfiguration(
        moduloId,
        signal
      ),
    [moduloId]
  );

  const {
    data: configuration,
    isLoading,
    error,
    refetch,
  } = useApiResource(
    fetcher,
    [moduloId],
    {
      enabled:
        isOpen && enabled,
      initialLoading: false,
    }
  );

  const groups = useMemo<Grupo[]>(
    () =>
      (
        configuration
          ?.availableGroups ?? []
      ).map((group) => ({
        idGrupo: group.groupId,
        nombreGrupo: group.name,
        idCliente: group.clientId,
        cliente: '',
        estado: 'Activo',
      })),
    [configuration]
  );

  const configuredGroupIds = useMemo(
    () =>
      [
        ...new Set(
          configuration?.groupIds ?? []
        ),
      ].sort((left, right) => left - right),
    [configuration]
  );

  const selectedGroupIds =
    editedGroupIds ?? configuredGroupIds;

  const hasValidGroupSelection =
    selectedGroupIds.length === 1 &&
    Number.isSafeInteger(
      selectedGroupIds[0]
    ) &&
    selectedGroupIds[0] > 0;

  const configuredReportClientPublications =
    useMemo(
      () => configuration?.clients ?? [],
      [configuration]
    );

  const configuredPublicationsByKey =
    useMemo(
      () =>
        buildReportClientPublicationIndex(
          configuredReportClientPublications
        ),
      [configuredReportClientPublications]
    );

  const reportClientPublications = useMemo(
    () =>
      mergeReportClientPublicationDrafts(
        configuredReportClientPublications,
        publicationDrafts
      ),
    [
      configuredReportClientPublications,
      publicationDrafts,
    ]
  );

  const hasReportClientConfiguration =
    configuredReportClientPublications.length > 0;

  const hasInvalidReportClientPublication =
    useMemo(
      () =>
        reportClientPublications.some(
          (publication) => {
            if (!publication.isAvailable) {
              return false;
            }

            const embedUrl =
              publication.embedUrl?.trim() ?? '';

            return (
              (
                embedUrl.length > 0 &&
                !isValidPowerBiPublishToWebUrl(
                  embedUrl
                )
              ) ||
              (
                embedUrl.length > 0 &&
                publication.groupIds.length === 0
              )
            );
          }
        ),
      [reportClientPublications]
    );

  const groupsDirty =
    editedGroupIds !== null &&
    editedGroupIds
      .slice()
      .sort((left, right) => left - right)
      .join(',') !==
      configuredGroupIds.join(',');

  const reportClientPublicationsDirty =
    publicationDrafts.size > 0 &&
    serializeReportClientPublications(
      reportClientPublications
    ) !==
      serializeReportClientPublications(
        configuredReportClientPublications
      );

  const onGroupSelectionChange =
    useCallback(
      (groupIds: number[]) => {
        setEditedGroupIds(groupIds);
        setGroupSelectionError(null);
      },
      []
    );

  const updatePublicationDraft =
    useCallback(
      (
        clientId: number,
        name: string,
        update: (
          publication: AnalyticsOptionReportClientPublication
        ) => AnalyticsOptionReportClientPublication
      ) => {
        const key =
          buildReportClientPublicationKey(
            clientId,
            name
          );

        setPublicationDrafts(
          (currentDrafts) => {
            const source =
              currentDrafts.get(key) ??
              configuredPublicationsByKey.get(key);

            if (!source) {
              return currentDrafts;
            }

            const nextDrafts =
              new Map(currentDrafts);

            nextDrafts.set(
              key,
              update(source)
            );

            return nextDrafts;
          }
        );
      },
      [configuredPublicationsByKey]
    );

  const onEmbedUrlChange =
    useCallback(
      (
        clientId: number,
        name: string,
        embedUrl: string
      ) => {
        updatePublicationDraft(
          clientId,
          name,
          (publication) => ({
            ...publication,
            embedUrl,
          })
        );
      },
      [updatePublicationDraft]
    );

  const onReportClientGroupIdsChange =
    useCallback(
      (
        clientId: number,
        name: string,
        groupIds: readonly number[]
      ) => {
        updatePublicationDraft(
          clientId,
          name,
          (publication) => ({
            ...publication,
            groupIds: [...groupIds],
          })
        );
      },
      [updatePublicationDraft]
    );

  const validateGroupSelection =
    useCallback((): string | null => {
      const message =
        hasValidGroupSelection
          ? null
          : GROUP_SELECTION_ERROR;

      setGroupSelectionError(message);

      return message;
    }, [hasValidGroupSelection]);

  const getPublicationsForSave =
    useCallback(
      (): AnalyticsReportClientPublicationInput[] | null => {
        if (!hasReportClientConfiguration) {
          return null;
        }

        const changed =
          getChangedReportClientPublications(
            reportClientPublications,
            configuredReportClientPublications
          );

        return changed.length > 0
          ? changed
          : null;
      },
      [
        configuredReportClientPublications,
        hasReportClientConfiguration,
        reportClientPublications,
      ]
    );

  return {
    groups,
    selectedGroupIds,
    reportClientPublications,
    hasReportClientConfiguration,
    hasInvalidReportClientPublication,
    hasValidGroupSelection,
    groupsDirty,
    reportClientPublicationsDirty,
    isLoading,
    error,
    groupSelectionError,
    refetch,
    validateGroupSelection,
    getPublicationsForSave,
    onGroupSelectionChange,
    onEmbedUrlChange,
    onReportClientGroupIdsChange,
  };
};
