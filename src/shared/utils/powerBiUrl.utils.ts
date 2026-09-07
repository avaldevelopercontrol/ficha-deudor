const POWER_BI_HOST = 'app.powerbi.com';
const POWER_BI_PUBLISH_PATH = '/view';

const parsePowerBiServiceUrl = (
  value: string | null | undefined
): URL | null => {
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
      url.username !== '' ||
      url.password !== '' ||
      url.port !== ''
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
};

export const normalizePowerBiServiceUrl = (
  value: string | null | undefined
): string | null =>
  parsePowerBiServiceUrl(value)?.toString() ?? null;

export const normalizePowerBiPublishToWebUrl = (
  value: string | null | undefined
): string | null => {
  const url = parsePowerBiServiceUrl(value);

  if (
    !url ||
    url.pathname.toLocaleLowerCase('en-US') !==
      POWER_BI_PUBLISH_PATH ||
    url.hash !== ''
  ) {
    return null;
  }

  const publishCodes = Array.from(
    url.searchParams.entries()
  )
    .filter(
      ([key]) =>
        key.toLocaleLowerCase('en-US') === 'r'
    )
    .map(([, code]) => code.trim());

  if (
    publishCodes.length !== 1 ||
    !publishCodes[0]
  ) {
    return null;
  }

  return url.toString();
};
