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
import { resolvePendingLastMainLogout } from '../utils/lastMainWindowLogout.utils';
import {
  closePopupOrRedirectToLogin,
  logoutSession,
} from '../utils/logoutSession';

export const processPendingLastMainLogout = ({
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

const isRelevantWindowStorageEvent = (event: StorageEvent) => {
  return (
    event.key === AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT ||
    event.key === AUTH_STORAGE_KEYS.MAIN_WINDOWS
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

    const processForPopup = () => {
      processPendingLastMainLogout({
        allowReloadCancel: false,
        waitGraceBeforeLogout: true,
      });
    };

    const popupIntervalId = window.setInterval(
      processForPopup,
      AUTH_WINDOW_TIMING.HEARTBEAT_MS
    );

    const handlePopupStorage = (event: StorageEvent) => {
      if (isRelevantWindowStorageEvent(event)) {
        processForPopup();
      }
    };

    window.addEventListener('storage', handlePopupStorage);

    return () => {
      window.clearInterval(popupIntervalId);
      window.removeEventListener('storage', handlePopupStorage);
    };
  }, [isPopup]);

  return processForMainWindow;
};
