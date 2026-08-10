import { useEffect } from 'react';

import { AUTH_STORAGE_KEYS } from '../constants/authStorage.constants';
import { AUTH_WINDOW_TIMING } from '../constants/authWindow.constants';
import {
  getExistingWindowId,
  getWindowId,
  registerMainWindow,
  unregisterMainWindow,
} from '../utils/authWindowStorage';
import { shouldUnregisterMainWindowOnPageHide } from '../utils/lastMainWindowLogout.utils';

interface UseMainWindowRegistrationOptions {
  isAuthenticated: boolean;
  isPopup: boolean;
  processPendingLogout: () => boolean;
}

const isRelevantWindowStorageEvent = (event: StorageEvent) => {
  return (
    event.key === AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT ||
    event.key === AUTH_STORAGE_KEYS.MAIN_WINDOWS
  );
};

export const useMainWindowRegistration = ({
  isAuthenticated,
  isPopup,
  processPendingLogout,
}: UseMainWindowRegistrationOptions) => {
  useEffect(() => {
    if (isPopup) {
      return;
    }

    if (processPendingLogout()) {
      return;
    }

    if (!isAuthenticated) {
      const currentWindowId = getExistingWindowId();

      if (currentWindowId) {
        unregisterMainWindow(currentWindowId, false);
      }

      return;
    }

    const windowId = getWindowId();
    let pageWasReleased = false;

    registerMainWindow(windowId);

    const heartbeatIntervalId = window.setInterval(() => {
      registerMainWindow(windowId);
    }, AUTH_WINDOW_TIMING.HEARTBEAT_MS);

    const handlePageHide = (event: PageTransitionEvent) => {
      if (
        pageWasReleased ||
        !shouldUnregisterMainWindowOnPageHide(event.persisted)
      ) {
        return;
      }

      pageWasReleased = true;
      unregisterMainWindow(windowId, true);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }

      pageWasReleased = false;
      registerMainWindow(windowId);
      processPendingLogout();
    };

    const handleStorage = (event: StorageEvent) => {
      if (isRelevantWindowStorageEvent(event)) {
        processPendingLogout();
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(heartbeatIntervalId);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('storage', handleStorage);

      if (!pageWasReleased) {
        unregisterMainWindow(windowId, false);
      }
    };
  }, [isAuthenticated, isPopup, processPendingLogout]);
};
