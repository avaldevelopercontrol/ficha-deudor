import { useCallback, useEffect } from 'react';

import { AUTH_STORAGE_KEYS } from '../constants/authStorage.constants';
import { AUTH_WINDOW_TIMING } from '../constants/authWindow.constants';
import {
  clearPendingLastMainLogout,
  getExistingWindowId,
  readMainWindowsRegistry,
  readPendingLastMainLogout,
  writeMainWindowsRegistry,
  type ProcessPendingLastMainLogoutOptions,
} from '../utils/authWindowStorage';
import { createAuthWindowSyncChannel } from '../utils/authWindowSyncChannel';
import {
  getPendingLastMainLogoutRetryDelay,
  resolvePendingLastMainLogout,
} from '../utils/lastMainWindowLogout.utils';
import {
  closePopupOrRedirectToLogin,
  logoutSession,
} from '../utils/logoutSession';

const processPendingLastMainLogout = ({
  allowReloadCancel,
  waitGraceBeforeLogout,
}: ProcessPendingLastMainLogoutOptions) => {
  const resolution = resolvePendingLastMainLogout({
    pendingLogout: readPendingLastMainLogout(),
    registry: readMainWindowsRegistry(),
    currentWindowId: getExistingWindowId(),
    allowSameWindowResume: allowReloadCancel,
    waitGraceBeforeLogout,
  });

  writeMainWindowsRegistry(resolution.cleanRegistry);

  if (resolution.action === 'none' || resolution.action === 'wait') {
    return false;
  }

  if (resolution.action === 'cancel') {
    clearPendingLastMainLogout();
    return false;
  }

  clearPendingLastMainLogout();
  logoutSession();
  closePopupOrRedirectToLogin();

  return true;
};

const shouldProcessWindowStorageEvent = (event: StorageEvent) => {
  if (event.key === AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT) {
    return true;
  }

  return (
    event.key === AUTH_STORAGE_KEYS.MAIN_WINDOWS &&
    readPendingLastMainLogout() !== null
  );
};

export const usePendingLastMainLogout = (isPopup: boolean) => {
  const processForMainWindow = useCallback(() => {
    return processPendingLastMainLogout({
      allowReloadCancel: true,
      waitGraceBeforeLogout: false,
    });
  }, []);

  useEffect(() => {
    if (!isPopup) {
      return;
    }

    let retryTimeoutId: number | null = null;
    let processTimeoutId: number | null = null;

    const clearRetryTimeout = () => {
      if (retryTimeoutId !== null) {
        window.clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
      }
    };

    const processForPopup = () => {
      clearRetryTimeout();

      const didLogout = processPendingLastMainLogout({
        allowReloadCancel: false,
        waitGraceBeforeLogout: true,
      });

      if (didLogout) {
        return;
      }

      const retryDelay = getPendingLastMainLogoutRetryDelay(
        readPendingLastMainLogout()
      );

      if (retryDelay !== null) {
        retryTimeoutId = window.setTimeout(processForPopup, retryDelay);
      }
    };

    const processForPopupSoon = () => {
      if (processTimeoutId !== null) {
        return;
      }

      processTimeoutId = window.setTimeout(() => {
        processTimeoutId = null;
        processForPopup();
      }, 0);
    };

    const windowSyncChannel = createAuthWindowSyncChannel((signal) => {
      if (
        signal === 'pending-logout' ||
        readPendingLastMainLogout() !== null
      ) {
        processForPopupSoon();
      }
    });

    const popupFallbackIntervalId = window.setInterval(
      processForPopup,
      AUTH_WINDOW_TIMING.POPUP_FALLBACK_CHECK_MS
    );

    const handlePopupStorage = (event: StorageEvent) => {
      if (shouldProcessWindowStorageEvent(event)) {
        processForPopupSoon();
      }
    };

    window.addEventListener('storage', handlePopupStorage);
    processForPopup();

    return () => {
      clearRetryTimeout();

      if (processTimeoutId !== null) {
        window.clearTimeout(processTimeoutId);
      }

      window.clearInterval(popupFallbackIntervalId);
      window.removeEventListener('storage', handlePopupStorage);
      windowSyncChannel?.close();
    };
  }, [isPopup]);

  return processForMainWindow;
};
