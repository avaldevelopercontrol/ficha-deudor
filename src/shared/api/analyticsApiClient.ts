import { env } from '@app/config/env';

import { apiClient } from './apiClient';

interface AnalyticsApiRequestOptions {
  includeSelectedCrmClientId?: boolean;
  crmClientId?: number | null;
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

interface StoredSisgesAnalyticsContext {
  userId: number | null;
  groupId: number | null;
}

const EMPTY_SISGES_ANALYTICS_CONTEXT:
  StoredSisgesAnalyticsContext = {
    userId: null,
    groupId: null,
  };

const toPositiveSafeInteger = (
  value: unknown
): number | null => {
  const parsed = Number(value);

  return Number.isSafeInteger(parsed) &&
    parsed > 0
    ? parsed
    : null;
};

const getStoredSisgesAnalyticsContext =
  (): StoredSisgesAnalyticsContext => {
    if (typeof localStorage === 'undefined') {
      return EMPTY_SISGES_ANALYTICS_CONTEXT;
    }

    try {
      const rawState = localStorage.getItem(
        AUTH_STATE_STORAGE_KEY
      );

      if (!rawState) {
        return EMPTY_SISGES_ANALYTICS_CONTEXT;
      }

      const state = JSON.parse(rawState) as {
        usuario?: {
          id_usuario?: unknown;
        } | null;
        clienteSeleccionada?: {
          id_grupo?: unknown;
        } | null;
      };

      return {
        userId: toPositiveSafeInteger(
          state.usuario?.id_usuario
        ),
        groupId: toPositiveSafeInteger(
          state.clienteSeleccionada?.id_grupo
        ),
      };
    } catch {
      return EMPTY_SISGES_ANALYTICS_CONTEXT;
    }
  };

const appendSelectedCrmClient = (
  path: string,
  includeSelectedCrmClientId: boolean,
  explicitCrmClientId?: number | null
): string => {
  const selectedCrmClientId = explicitCrmClientId ??
    (includeSelectedCrmClientId ? getStoredCrmClientId() : null);

  if (selectedCrmClientId === null) {
    return path;
  }

  if (
    !Number.isSafeInteger(selectedCrmClientId) ||
    selectedCrmClientId <= 0
  ) {
    throw new Error('crmClientId debe ser un entero positivo.');
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
    const { userId, groupId } =
      getStoredSisgesAnalyticsContext();

    const headers: Record<string, string> = {};

    if (userId !== null) {
      headers['X-Sisges-User-Id'] =
        String(userId);
    }

    if (groupId !== null) {
      headers['X-Sisges-Group-Id'] =
        String(groupId);
    }

    return headers;
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
          true,
        options.crmClientId
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
          true,
        options.crmClientId
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

  patch<T = void>(
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
          true,
        options.crmClientId
      ),
      {
        method: 'PATCH',
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
