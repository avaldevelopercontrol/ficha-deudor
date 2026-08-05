import { useEffect, type Dispatch, type SetStateAction } from 'react';

import {
  AUTH_LOGOUT_CUSTOM_EVENT,
  AUTH_STORAGE_KEYS,
} from '../constants/authStorage.constants';
import type { AuthState } from '../types';
import {
  initialAuthState,
  resolveAuthStorageSyncAction,
} from '../utils';

export const useAuthExternalSessionSync = (
  setState: Dispatch<SetStateAction<AuthState>>,
  onExternalSessionChange?: () => void
) => {
  useEffect(() => {
    const resetExternalSession = () => {
      onExternalSessionChange?.();
      setState(initialAuthState);
    };

    const handleExternalLogout = () => {
      resetExternalSession();
    };

    const handleStorageChange = (event: StorageEvent) => {
      const action = resolveAuthStorageSyncAction(
        event.key,
        event.newValue
      );

      if (action.type === 'ignore') {
        return;
      }

      onExternalSessionChange?.();

      if (action.type === 'reset') {
        if (action.removeInvalidState) {
          localStorage.removeItem(AUTH_STORAGE_KEYS.STATE);
        }

        setState(initialAuthState);
        return;
      }

      setState(action.state);
    };

    window.addEventListener(AUTH_LOGOUT_CUSTOM_EVENT, handleExternalLogout);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(
        AUTH_LOGOUT_CUSTOM_EVENT,
        handleExternalLogout
      );
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [onExternalSessionChange, setState]);
};
