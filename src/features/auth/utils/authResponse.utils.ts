import type { LoginResponse } from '../types';

export const buildLoginErrorResponse = (message: string): LoginResponse => ({
  success: false,
  message,
  usuario: null,
});
