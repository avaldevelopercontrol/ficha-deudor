import {
  APPLICATION_OPTION_IDS,
  type AuthorizedOption,
} from '@features/access-control';

import {
  normalizePowerBiPublishToWebUrl,
  normalizePowerBiServiceUrl,
} from '@shared/utils/powerBiUrl.utils';

export const findAuthorizedOptionById = (
  options: readonly AuthorizedOption[],
  optionId: number
): AuthorizedOption | null => {
  for (const option of options) {
    if (option.id === optionId) {
      return option;
    }

    const child = findAuthorizedOptionById(
      option.children,
      optionId
    );

    if (child) {
      return child;
    }
  }

  return null;
};

export const getAuthorizedPowerBiReports = (
  menuTree: readonly AuthorizedOption[]
): AuthorizedOption[] => {
  const reporteria =
    findAuthorizedOptionById(
      menuTree,
      APPLICATION_OPTION_IDS.REPORTERIA
    );

  if (!reporteria) {
    return [];
  }

  return reporteria.children.filter(
    (option) =>
      option.parentId ===
        APPLICATION_OPTION_IDS.REPORTERIA &&
      option.permissions.consultar &&
      Boolean(
        normalizePowerBiServiceUrl(option.urlBI)
      )
  );
};


export const buildPowerBiReportAccessKey = (
  reports: readonly AuthorizedOption[]
): string =>
  reports
    .map((report) => report.id)
    .sort((left, right) => left - right)
    .join(',');

export const retainAvailablePowerBiReportIds = (
  reports: readonly AuthorizedOption[],
  selectedReportIds: readonly number[]
): number[] => {
  const availableIds = new Set(
    reports.map((report) => report.id)
  );

  return selectedReportIds.filter((reportId) =>
    availableIds.has(reportId)
  );
};

export const filterPowerBiReportsBySelection = (
  reports: readonly AuthorizedOption[],
  selectedReportIds: readonly number[]
): AuthorizedOption[] => {
  if (selectedReportIds.length === 0) {
    return [...reports];
  }

  const selectedIds = new Set(selectedReportIds);

  return reports.filter((report) =>
    selectedIds.has(report.id)
  );
};

export const filterPowerBiReports = (
  reports: readonly AuthorizedOption[],
  search: string
): AuthorizedOption[] => {
  const normalizedSearch = search
    .trim()
    .toLocaleLowerCase('es-PE');

  if (!normalizedSearch) {
    return [...reports];
  }

  return reports.filter((report) => {
    const searchableText = [
      report.name,
      report.description,
      report.code,
    ]
      .join(' ')
      .toLocaleLowerCase('es-PE');

    return searchableText.includes(
      normalizedSearch
    );
  });
};

export const resolvePowerBiPublishToWebUrl = (
  value: string | null
): string | null =>
  normalizePowerBiPublishToWebUrl(value);

export const resolvePowerBiEmbedUrl = (
  value: string | null
): string | null =>
  normalizePowerBiServiceUrl(value);

export const resolveReportImageSource = (
  value: string | null
): string | null => {
  const normalized = value?.trim() ?? '';

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith('/')) {
    return normalized.startsWith('//')
      ? null
      : normalized;
  }

  try {
    const url = new URL(normalized);

    if (
      url.protocol !== 'https:' &&
      url.protocol !== 'http:'
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};
