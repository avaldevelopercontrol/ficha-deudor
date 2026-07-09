import { useEffect, type Dispatch, type SetStateAction } from 'react';

import {
  AUTH_LOGOUT_CUSTOM_EVENT,
  AUTH_STORAGE_KEYS,
} from '../constants/authStorage.constants';
import type { AuthState } from '../types';
import { initialAuthState } from '../utils/authStorage';

export const useAuthExternalLogoutSync = (
  setState: Dispatch<SetStateAction<AuthState>>
) => {
  useEffect(() => {
    const handleExternalLogout = () => {
      setState(initialAuthState);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEYS.LOGOUT_EVENT) {
        setState(initialAuthState);
        return;
      }

      if (event.key === AUTH_STORAGE_KEYS.STATE && event.newValue === null) {
        setState(initialAuthState);
      }
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
  }, [setState]);
};
