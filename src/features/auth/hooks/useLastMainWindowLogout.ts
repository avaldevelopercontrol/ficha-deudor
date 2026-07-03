import { useEffect } from 'react';

import {
  closePopupOrRedirectToLogin,
  logoutSession,
} from '../utils/logoutSession';

const MAIN_WINDOWS_STORAGE_KEY = 'ficha_deudor_main_windows';
const PENDING_LAST_MAIN_LOGOUT_KEY = 'ficha_deudor_pending_last_main_logout';
const WINDOW_ID_SESSION_KEY = 'ficha_deudor_window_id';

const HEARTBEAT_MS = 1000;
const ACTIVE_WINDOW_TTL_MS = 15000;
const RELOAD_GRACE_MS = 5000;

type MainWindowItem = {
  id: string;
  path: string;
  lastSeen: number;
};

type MainWindowsRegistry = Record<string, MainWindowItem>;

type PendingLastMainLogout = {
  closedWindowId: string;
  requestedAt: number;
};

type ProcessPendingOptions = {
  allowReloadCancel: boolean;
  waitGraceBeforeLogout: boolean;
};

const POPUP_PATH_KEYWORDS = [
  'email-deudor-popup',
  'agenda-deudor-popup',
  'pago-deudor-popup',
  'inf-deudor-popup',
  'emaildeudorpopup',
  'agendadeudorpopup',
  'pagodeudorpopup',
  'infdeudorpopup',
];

const getNavigationType = () => {
  const [navigationEntry] = performance.getEntriesByType(
    'navigation'
  ) as PerformanceNavigationTiming[];

  return navigationEntry?.type ?? 'navigate';
};

const getExistingWindowId = () => {
  return sessionStorage.getItem(WINDOW_ID_SESSION_KEY);
};

const getWindowId = () => {
  const currentWindowId = getExistingWindowId();

  if (currentWindowId) {
    return currentWindowId;
  }

  const newWindowId =
    window.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  sessionStorage.setItem(WINDOW_ID_SESSION_KEY, newWindowId);

  return newWindowId;
};

const isPopupWindow = () => {
  const pathname = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();

  if (window.opener) {
    return true;
  }

  if (search.includes('popup=1') || search.includes('popup=true')) {
    return true;
  }

  return POPUP_PATH_KEYWORDS.some((keyword) => pathname.includes(keyword));
};

const readMainWindowsRegistry = (): MainWindowsRegistry => {
  try {
    const rawRegistry = localStorage.getItem(MAIN_WINDOWS_STORAGE_KEY);

    if (!rawRegistry) {
      return {};
    }

    const parsedRegistry = JSON.parse(rawRegistry) as MainWindowsRegistry;

    if (!parsedRegistry || typeof parsedRegistry !== 'object') {
      return {};
    }

    return parsedRegistry;
  } catch {
    return {};
  }
};

const writeMainWindowsRegistry = (registry: MainWindowsRegistry) => {
  if (Object.keys(registry).length === 0) {
    localStorage.removeItem(MAIN_WINDOWS_STORAGE_KEY);
    return;
  }

  localStorage.setItem(MAIN_WINDOWS_STORAGE_KEY, JSON.stringify(registry));
};

const getCleanActiveRegistry = (
  registry: MainWindowsRegistry,
  now = Date.now()
): MainWindowsRegistry => {
  return Object.fromEntries(
    Object.entries(registry).filter(([, windowItem]) => {
      return now - windowItem.lastSeen <= ACTIVE_WINDOW_TTL_MS;
    })
  );
};

const registerMainWindow = (windowId: string) => {
  const now = Date.now();
  const registry = getCleanActiveRegistry(readMainWindowsRegistry(), now);

  registry[windowId] = {
    id: windowId,
    path: `${window.location.pathname}${window.location.search}`,
    lastSeen: now,
  };

  writeMainWindowsRegistry(registry);
};

const readPendingLastMainLogout = (): PendingLastMainLogout | null => {
  try {
    const rawPendingLogout = localStorage.getItem(PENDING_LAST_MAIN_LOGOUT_KEY);

    if (!rawPendingLogout) {
      return null;
    }

    return JSON.parse(rawPendingLogout) as PendingLastMainLogout;
  } catch {
    localStorage.removeItem(PENDING_LAST_MAIN_LOGOUT_KEY);
    return null;
  }
};

const requestLastMainWindowLogout = (closedWindowId: string) => {
  const pendingLogout: PendingLastMainLogout = {
    closedWindowId,
    requestedAt: Date.now(),
  };

  localStorage.setItem(
    PENDING_LAST_MAIN_LOGOUT_KEY,
    JSON.stringify(pendingLogout)
  );
};

const unregisterMainWindow = (
  windowId: string,
  shouldLogoutIfLastMainWindow: boolean
) => {
  const registry = getCleanActiveRegistry(readMainWindowsRegistry());

  delete registry[windowId];

  writeMainWindowsRegistry(registry);

  if (!shouldLogoutIfLastMainWindow) {
    return;
  }

  const activeMainWindows = Object.values(registry);

  if (activeMainWindows.length === 0) {
    requestLastMainWindowLogout(windowId);
  }
};

const processPendingLastMainLogout = ({
  allowReloadCancel,
  waitGraceBeforeLogout,
}: ProcessPendingOptions) => {
  const pendingLogout = readPendingLastMainLogout();

  if (!pendingLogout) {
    return false;
  }

  const now = Date.now();
  const cleanRegistry = getCleanActiveRegistry(readMainWindowsRegistry(), now);
  const activeMainWindows = Object.values(cleanRegistry);

  writeMainWindowsRegistry(cleanRegistry);

  if (activeMainWindows.length > 0) {
    localStorage.removeItem(PENDING_LAST_MAIN_LOGOUT_KEY);
    return false;
  }

  const currentWindowId = getExistingWindowId();
  const navigationType = getNavigationType();
  const elapsedMs = now - pendingLogout.requestedAt;

  const isSameWindowReload =
    allowReloadCancel &&
    currentWindowId === pendingLogout.closedWindowId &&
    navigationType === 'reload' &&
    elapsedMs <= RELOAD_GRACE_MS;

  if (isSameWindowReload) {
    localStorage.removeItem(PENDING_LAST_MAIN_LOGOUT_KEY);
    return false;
  }

  if (waitGraceBeforeLogout && elapsedMs <= RELOAD_GRACE_MS) {
    return false;
  }

  localStorage.removeItem(PENDING_LAST_MAIN_LOGOUT_KEY);

  logoutSession();
  closePopupOrRedirectToLogin();

  return true;
};

export const useLastMainWindowLogout = (isAuthenticated: boolean) => {
  useEffect(() => {
    const popupWindow = isPopupWindow();

    if (popupWindow) {
      const popupIntervalId = window.setInterval(() => {
        processPendingLastMainLogout({
          allowReloadCancel: false,
          waitGraceBeforeLogout: true,
        });
      }, HEARTBEAT_MS);

      const handlePopupStorage = (event: StorageEvent) => {
        if (
          event.key === PENDING_LAST_MAIN_LOGOUT_KEY ||
          event.key === MAIN_WINDOWS_STORAGE_KEY
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
    }

    const pendingLogoutProcessed = processPendingLastMainLogout({
      allowReloadCancel: true,
      waitGraceBeforeLogout: false,
    });

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
    }, HEARTBEAT_MS);

    const handleWindowClose = () => {
      if (isClosingWindow) {
        return;
      }

      isClosingWindow = true;

      unregisterMainWindow(windowId, true);
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === PENDING_LAST_MAIN_LOGOUT_KEY ||
        event.key === MAIN_WINDOWS_STORAGE_KEY
      ) {
        processPendingLastMainLogout({
          allowReloadCancel: true,
          waitGraceBeforeLogout: false,
        });
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
  }, [isAuthenticated]);
};