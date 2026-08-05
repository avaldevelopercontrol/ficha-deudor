import { ApiError } from '@shared/api/apiClient';
import { getApiErrorMessage } from '@shared/api/apiResponse.utils';

import { AUTH_API_MESSAGES } from '../constants/authApi.constants';
import type { LoginResponse } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const buildLoginErrorResponse = (message: string): LoginResponse => ({
  success: false,
  message,
  usuario: null,
});

export const buildLoginCancelledResponse = (): LoginResponse => ({
  ...buildLoginErrorResponse(AUTH_API_MESSAGES.LOGIN_CANCELLED),
  cancelled: true,
});

export const getLoginRequestErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && isRecord(error.data)) {
    return getApiErrorMessage(
      error.data,
      AUTH_API_MESSAGES.LOGIN_UNEXPECTED_ERROR
    );
  }

  return error instanceof Error
    ? error.message
    : AUTH_API_MESSAGES.LOGIN_UNEXPECTED_ERROR;
};
