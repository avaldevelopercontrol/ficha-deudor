import { useEffect } from 'react';

import { AUTH_STORAGE_KEYS } from '../constants/authStorage.constants';
import { AUTH_WINDOW_TIMING } from '../constants/authWindow.constants';
import {
  getExistingWindowId,
  getWindowId,
  readPendingLastMainLogout,
  registerMainWindow,
  unregisterMainWindow,
} from '../utils/authWindowStorage';
import { createAuthWindowSyncChannel } from '../utils/authWindowSyncChannel';
import { shouldUnregisterMainWindowOnPageHide } from '../utils/lastMainWindowLogout.utils';

interface UseMainWindowRegistrationOptions {
  isAuthenticated: boolean;
  isPopup: boolean;
  processPendingLogout: () => boolean;
}

const shouldProcessWindowStorageEvent = (event: StorageEvent) => {
  if (event.key === AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT) {
    return true;
  }

  return (
    event.key === AUTH_STORAGE_KEYS.MAIN_WINDOWS &&
    readPendingLastMainLogout() !== null
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
    let pendingProcessTimeoutId: number | null = null;

    const processPendingLogoutSoon = () => {
      if (pendingProcessTimeoutId !== null) {
        return;
      }

      pendingProcessTimeoutId = window.setTimeout(() => {
        pendingProcessTimeoutId = null;
        processPendingLogout();
      }, 0);
    };

    const windowSyncChannel = createAuthWindowSyncChannel((signal) => {
      if (
        signal === 'pending-logout' ||
        readPendingLastMainLogout() !== null
      ) {
        processPendingLogoutSoon();
      }
    });

    const refreshPresence = (notifyPeers = false) => {
      registerMainWindow(windowId);

      if (notifyPeers) {
        windowSyncChannel?.publish('presence-changed');
      }
    };

    refreshPresence(true);

    const heartbeatIntervalId = window.setInterval(() => {
      refreshPresence();
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
      windowSyncChannel?.publish('pending-logout');
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }

      pageWasReleased = false;
      refreshPresence(true);
      processPendingLogout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !pageWasReleased) {
        refreshPresence(true);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (shouldProcessWindowStorageEvent(event)) {
        processPendingLogoutSoon();
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(heartbeatIntervalId);

      if (pendingProcessTimeoutId !== null) {
        window.clearTimeout(pendingProcessTimeoutId);
      }

      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (!pageWasReleased) {
        unregisterMainWindow(windowId, false);
        windowSyncChannel?.publish('presence-changed');
      }

      windowSyncChannel?.close();
    };
  }, [isAuthenticated, isPopup, processPendingLogout]);
};
