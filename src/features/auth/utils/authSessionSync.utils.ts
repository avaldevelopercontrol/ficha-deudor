import { AUTH_STORAGE_KEYS } from '../constants/authStorage.constants';
import type { AuthState } from '../types';
import { parseStoredAuthSession } from '../validations/authSession.guard';

export type AuthStorageSyncAction =
  | { type: 'ignore' }
  | { type: 'reset'; removeInvalidState: boolean }
  | { type: 'restore'; state: AuthState };

export const resolveAuthStorageSyncAction = (
  key: string | null,
  newValue: string | null,
  now = Date.now()
): AuthStorageSyncAction => {
  if (key === AUTH_STORAGE_KEYS.LOGOUT_EVENT) {
    return {
      type: 'reset',
      removeInvalidState: false,
    };
  }

  if (key !== AUTH_STORAGE_KEYS.STATE) {
    return { type: 'ignore' };
  }

  if (newValue === null) {
    return {
      type: 'reset',
      removeInvalidState: false,
    };
  }

  const parsedSession = parseStoredAuthSession(newValue, now);

  if (!parsedSession) {
    return {
      type: 'reset',
      removeInvalidState: true,
    };
  }

  return {
    type: 'restore',
    state: parsedSession.state,
  };
};
