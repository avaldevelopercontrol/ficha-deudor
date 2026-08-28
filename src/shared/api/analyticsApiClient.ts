import { env } from '@app/config/env';

import { apiClient } from './apiClient';

interface AnalyticsApiRequestOptions {
  includeSelectedCrmClientId?: boolean;
  signal?: AbortSignal;
}

const SELECTED_CRM_CLIENT_ID_KEY =
  'analytics.selectedCrmClientId';

const AUTH_STATE_STORAGE_KEY =
  'ficha_deudor_auth_state';

const getStoredCrmClientId = (): number | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  const rawValue = localStorage.getItem(
    SELECTED_CRM_CLIENT_ID_KEY
  );

  if (!rawValue) {
    return null;
  }

  const crmClientId = Number(rawValue);

  return Number.isSafeInteger(crmClientId) &&
    crmClientId > 0
    ? crmClientId
    : null;
};

const getStoredSisgesUserId = (): number | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const rawState = localStorage.getItem(
      AUTH_STATE_STORAGE_KEY
    );

    if (!rawState) {
      return null;
    }

    const state = JSON.parse(rawState) as {
      usuario?: {
        id_usuario?: unknown;
      } | null;
    };

    const userId = Number(
      state.usuario?.id_usuario
    );

    return Number.isSafeInteger(userId) &&
      userId > 0
      ? userId
      : null;
  } catch {
    return null;
  }
};

const appendSelectedCrmClient = (
  path: string,
  includeSelectedCrmClientId: boolean
): string => {
  if (!includeSelectedCrmClientId) {
    return path;
  }

  const selectedCrmClientId =
    getStoredCrmClientId();

  if (selectedCrmClientId === null) {
    return path;
  }

  const separator =
    path.includes('?')
      ? '&'
      : '?';

  return `${path}${separator}crmClientId=${encodeURIComponent(
    selectedCrmClientId
  )}`;
};

const getAnalyticsIdentityHeaders =
  (): Record<string, string> => {
    if (!import.meta.env.DEV) {
      return {};
    }

    const userId =
      getStoredSisgesUserId();

    return userId === null
      ? {}
      : {
          'X-Sisges-User-Id':
            String(userId),
        };
  };

export const analyticsApiClient = {
  get<T>(
    path: string,
    options:
      AnalyticsApiRequestOptions = {}
  ): Promise<T> {
    return apiClient<T>(
      appendSelectedCrmClient(
        path,
        options
          .includeSelectedCrmClientId ??
          true
      ),
      {
        method: 'GET',
        baseUrl:
          env.analyticsApiBaseUrl,
        headers:
          getAnalyticsIdentityHeaders(),
        signal: options.signal,
        useMock: false,
      }
    );
  },

  put<T = void>(
    path: string,
    body: unknown,
    options:
      AnalyticsApiRequestOptions = {}
  ): Promise<T> {
    return apiClient<T>(
      appendSelectedCrmClient(
        path,
        options
          .includeSelectedCrmClientId ??
          true
      ),
      {
        method: 'PUT',
        baseUrl:
          env.analyticsApiBaseUrl,
        headers:
          getAnalyticsIdentityHeaders(),
        body,
        signal: options.signal,
        useMock: false,
      }
    );
  },
};
