import { useCallback, useEffect } from 'react';

import { AUTH_STORAGE_KEYS } from '../constants/authStorage.constants';
import { AUTH_WINDOW_TIMING } from '../constants/authWindow.constants';
import {
  clearPendingLastMainLogout,
  getCleanActiveRegistry,
  getExistingWindowId,
  getNavigationType,
  getWindowId,
  isPopupWindow,
  readMainWindowsRegistry,
  readPendingLastMainLogout,
  registerMainWindow,
  unregisterMainWindow,
  writeMainWindowsRegistry,
  type ProcessPendingLastMainLogoutOptions,
} from '../utils/authWindowStorage';
import {
  closePopupOrRedirectToLogin,
  logoutSession,
} from '../utils/logoutSession';

const processPendingLastMainLogout = ({
  allowReloadCancel,
  waitGraceBeforeLogout,
}: ProcessPendingLastMainLogoutOptions) => {
  const pendingLogout = readPendingLastMainLogout();

  if (!pendingLogout) {
    return false;
  }

  const now = Date.now();
  const cleanRegistry = getCleanActiveRegistry(readMainWindowsRegistry(), now);
  const activeMainWindows = Object.values(cleanRegistry);

  writeMainWindowsRegistry(cleanRegistry);

  if (activeMainWindows.length > 0) {
    clearPendingLastMainLogout();
    return false;
  }

  const currentWindowId = getExistingWindowId();
  const navigationType = getNavigationType();
  const elapsedMs = now - pendingLogout.requestedAt;

  const isSameWindowReload =
    allowReloadCancel &&
    currentWindowId === pendingLogout.closedWindowId &&
    navigationType === 'reload' &&
    elapsedMs <= AUTH_WINDOW_TIMING.RELOAD_GRACE_MS;

  if (isSameWindowReload) {
    clearPendingLastMainLogout();
    return false;
  }

  if (
    waitGraceBeforeLogout &&
    elapsedMs <= AUTH_WINDOW_TIMING.RELOAD_GRACE_MS
  ) {
    return false;
  }

  clearPendingLastMainLogout();

  logoutSession();
  closePopupOrRedirectToLogin();

  return true;
};

const usePendingLogoutListener = (isPopup: boolean) => {
  useEffect(() => {
    if (!isPopup) {
      return;
    }

    const popupIntervalId = window.setInterval(() => {
      processPendingLastMainLogout({
        allowReloadCancel: false,
        waitGraceBeforeLogout: true,
      });
    }, AUTH_WINDOW_TIMING.HEARTBEAT_MS);

    const handlePopupStorage = (event: StorageEvent) => {
      if (
        event.key === AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT ||
        event.key === AUTH_STORAGE_KEYS.MAIN_WINDOWS
      ) {
        processPendingLastMainLogout({
          allowReloadCancel: false,
          waitGraceBeforeLogout: true,
        });
      }
    };

    window.addEventListener('storage', handlePopupStorage);

    return () => {
      window.clearInterval(popupIntervalId);
      window.removeEventListener('storage', handlePopupStorage);
    };
  }, [isPopup]);
};

export const useLastMainWindowLogout = (isAuthenticated: boolean) => {
  const popupWindow = isPopupWindow();

  usePendingLogoutListener(popupWindow);

  const processMainWindowPendingLogout = useCallback(() => {
    return processPendingLastMainLogout({
      allowReloadCancel: true,
      waitGraceBeforeLogout: false,
    });
  }, []);

  useEffect(() => {
    if (popupWindow) {
      return;
    }

    const pendingLogoutProcessed = processMainWindowPendingLogout();

    if (pendingLogoutProcessed) {
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

    registerMainWindow(windowId);

    let isClosingWindow = false;

    const heartbeatIntervalId = window.setInterval(() => {
      registerMainWindow(windowId);
    }, AUTH_WINDOW_TIMING.HEARTBEAT_MS);

    const handleWindowClose = () => {
      if (isClosingWindow) {
        return;
      }

      isClosingWindow = true;

      unregisterMainWindow(windowId, true);
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT ||
        event.key === AUTH_STORAGE_KEYS.MAIN_WINDOWS
      ) {
        processMainWindowPendingLogout();
      }
    };

    window.addEventListener('pagehide', handleWindowClose);
    window.addEventListener('beforeunload', handleWindowClose);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(heartbeatIntervalId);

      window.removeEventListener('pagehide', handleWindowClose);
      window.removeEventListener('beforeunload', handleWindowClose);
      window.removeEventListener('storage', handleStorage);

      if (!isClosingWindow) {
        unregisterMainWindow(windowId, false);
      }
    };
  }, [isAuthenticated, popupWindow, processMainWindowPendingLogout]);
};
