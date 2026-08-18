import { ApiError } from '@shared/api/apiClient';
import { getApiErrorMessage } from '@shared/api/apiResponse.utils';
import { toRequiredId } from '@shared/utils/number.utils';

import {
  AUTH_API_MESSAGES,
  AUTH_LOGIN_CODES,
} from '../constants/authApi.constants';
import type { ExpiredPasswordChallenge, LoginResponse } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);


export const buildExpiredPasswordChallenge = (
  username: string,
  message: string
): ExpiredPasswordChallenge | null => {
  try {
    return {
      userId: String(toRequiredId(username, 'nId_Usuario')),
      message,
    };
  } catch {
    return null;
  }
};

export const buildLoginErrorResponse = (
  message: string,
  code: string = AUTH_LOGIN_CODES.CLIENT_ERROR
): LoginResponse => ({
  success: false,
  code,
  message,
  usuario: null,
});

export const buildLoginCancelledResponse = (): LoginResponse => ({
  ...buildLoginErrorResponse(
    AUTH_API_MESSAGES.LOGIN_CANCELLED,
    AUTH_LOGIN_CODES.CANCELLED
  ),
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
