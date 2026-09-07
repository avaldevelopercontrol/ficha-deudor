import { clearAnalyticsAccessSession } from '@features/analytics/access/services/analyticsAccess.prefetch';
import { clearSelectedCrmClientId } from '@features/analytics/access/store/analyticsCrmSelection.storage';
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
  resetTransientAuthState?: () => void
) => {
  useEffect(() => {
    const resetExternalSession = () => {
      clearAnalyticsAccessSession();
      clearSelectedCrmClientId();
      resetTransientAuthState?.();
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

      resetTransientAuthState?.();

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
  }, [resetTransientAuthState, setState]);
};
