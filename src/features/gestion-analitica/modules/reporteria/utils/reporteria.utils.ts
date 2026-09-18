import {
  normalizePowerBiPublishToWebUrl,
  normalizePowerBiServiceUrl,
} from '@shared/utils/powerBiUrl.utils';

import type {
  PowerBiReport,
} from '../domain/reporteria.types';

export const getAvailablePowerBiReports = (
  reports: readonly PowerBiReport[]
): PowerBiReport[] =>
  reports.filter((report) =>
    Boolean(normalizePowerBiServiceUrl(report.serviceUrl))
  );

export const findPowerBiReportById = (
  reports: readonly PowerBiReport[],
  reportId: number
): PowerBiReport | null =>
  reports.find((report) => report.id === reportId) ?? null;

export const buildPowerBiReportAccessKey = (
  reports: readonly PowerBiReport[]
): string =>
  reports
    .map((report) => report.id)
    .sort((left, right) => left - right)
    .join(',');

export const retainAvailablePowerBiReportIds = (
  reports: readonly PowerBiReport[],
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
  reports: readonly PowerBiReport[],
  selectedReportIds: readonly number[]
): PowerBiReport[] => {
  if (selectedReportIds.length === 0) {
    return [...reports];
  }

  const selectedIds = new Set(selectedReportIds);

  return reports.filter((report) =>
    selectedIds.has(report.id)
  );
};

export const filterPowerBiReports = (
  reports: readonly PowerBiReport[],
  search: string
): PowerBiReport[] => {
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
