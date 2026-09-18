import {
  analyticsApiClient,
} from '@shared/api/analyticsApiClient';

import {
  assertPositiveIntegerParam,
} from './centroControlCarteraApi.params';

const appendCrmClientId = (
  endpoint: string,
  crmClientId: number
): string => {
  const separator = endpoint.includes('?') ? '&' : '?';

  return `${endpoint}${separator}idClienteCrm=${encodeURIComponent(
    String(crmClientId)
  )}`;
};

export const fetchValidatedCentroControlCarteraResponse = async <T>(
  crmClientId: number,
  endpoint: string,
  signal: AbortSignal,
  normalize: (value: unknown) => unknown,
  parse: (value: unknown) => T
): Promise<T> => {
  assertPositiveIntegerParam('idClienteCrm', crmClientId);

  const response = await analyticsApiClient.get<unknown>(
    appendCrmClientId(endpoint, crmClientId),
    {
      includeSelectedCrmClientId: false,
      signal,
    }
  );

  return parse(normalize(response));
};
