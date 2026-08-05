import type { LoginPayload } from '../types';

export const buildLoginQuery = (
  payload: LoginPayload
): URLSearchParams =>
  new URLSearchParams({
    cUsr_Login: payload.username.trim(),
    cUsr_Pass: payload.password,
  });

export const buildLoginEndpoint = (
  endpoint: string,
  payload: LoginPayload
): string => `${endpoint}?${buildLoginQuery(payload).toString()}`;
