import {
  APPLICATION_OPTION_IDS,
  type AuthorizedOption,
} from '@features/access-control';

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
      Boolean(option.urlBI?.trim())
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

const POWER_BI_HOST = 'app.powerbi.com';
const POWER_BI_PUBLISH_PATH = '/view';

export const resolvePowerBiPublishToWebUrl = (
  value: string | null
): string | null => {
  const normalized = value?.trim() ?? '';

  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);

    if (
      url.protocol !== 'https:' ||
      url.hostname.toLocaleLowerCase('en-US') !==
        POWER_BI_HOST ||
      url.pathname.toLocaleLowerCase('en-US') !==
        POWER_BI_PUBLISH_PATH ||
      !url.searchParams.get('r')
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};

export const resolvePowerBiEmbedUrl = (
  value: string | null
): string | null => {
  const normalized = value?.trim() ?? '';

  if (!normalized) {
    return null;
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
