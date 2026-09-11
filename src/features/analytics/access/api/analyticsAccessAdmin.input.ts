import { normalizePowerBiPublishToWebUrl } from '@shared/utils/powerBiUrl.utils';

import type {
  AnalyticsReportClientPublicationInput,
  SyncAnalyticsPowerBiConfigurationInput,
} from '../domain/analyticsAccessAdmin.types';

interface SyncAnalyticsPowerBiConfigurationPayload {
  optionCode: string;
  optionName: string;
  isActive: boolean;
  groupIds: number[];
  publications: Array<{
    clientId: number;
    name: string;
    groupIds: number[] | null;
    embedUrl: string;
  }>;
}

export const assertAnalyticsPositiveInteger = (
  name: string,
  value: number
): void => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
};

export const normalizeAnalyticsRequiredText = (
  name: string,
  value: string
): string => {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${name} no puede estar vacío.`);
  }

  return normalized;
};

export const normalizeAnalyticsPositiveIds = (
  name: string,
  ids: readonly number[]
): number[] => {
  const normalized = [...new Set(ids)].sort(
    (left, right) => left - right
  );

  for (const id of normalized) {
    assertAnalyticsPositiveInteger(name, id);
  }

  return normalized;
};

const normalizePublication = (
  publication: AnalyticsReportClientPublicationInput,
  index: number
) => {
  const prefix = `publications[${index}]`;
  assertAnalyticsPositiveInteger(
    `${prefix}.clientId`,
    publication.clientId
  );
  const name = normalizeAnalyticsRequiredText(
    `${prefix}.name`,
    publication.name
  );
  const embedUrl = normalizePowerBiPublishToWebUrl(
    publication.embedUrl
  );

  if (!embedUrl) {
    throw new Error(
      `${prefix}.embedUrl debe ser una URL pública válida de Power BI.`
    );
  }

  return {
    clientId: publication.clientId,
    name,
    groupIds:
      publication.groupIds === null
        ? null
        : normalizeAnalyticsPositiveIds(
            `${prefix}.groupIds`,
            publication.groupIds
          ),
    embedUrl,
  };
};

export const buildSyncAnalyticsPowerBiConfigurationPayload = (
  input: SyncAnalyticsPowerBiConfigurationInput
): SyncAnalyticsPowerBiConfigurationPayload => {
  assertAnalyticsPositiveInteger('optionId', input.optionId);
  const optionCode = normalizeAnalyticsRequiredText(
    'optionCode',
    input.optionCode
  );
  const optionName = normalizeAnalyticsRequiredText(
    'optionName',
    input.optionName
  );
  const groupIds = normalizeAnalyticsPositiveIds(
    'groupIds',
    input.groupIds
  );

  if (groupIds.length === 0) {
    throw new Error(
      'El tablero Power BI debe tener al menos un grupo asociado.'
    );
  }

  return {
    optionCode,
    optionName,
    isActive: input.isActive,
    groupIds,
    publications: (input.publications ?? []).map(
      normalizePublication
    ),
  };
};
