import {
  AUTH_POPUP_PATH_KEYWORDS,
  AUTH_WINDOW_TIMING,
} from '../constants/authWindow.constants';
import { AUTH_STORAGE_KEYS } from '../constants/authStorage.constants';

export type MainWindowItem = {
  id: string;
  path: string;
  lastSeen: number;
};

export type MainWindowsRegistry = Record<string, MainWindowItem>;

export type PendingLastMainLogout = {
  closedWindowId: string;
  requestedAt: number;
};

export type ProcessPendingLastMainLogoutOptions = {
  allowReloadCancel: boolean;
  waitGraceBeforeLogout: boolean;
};

export const getNavigationType = () => {
  const [navigationEntry] = performance.getEntriesByType(
    'navigation'
  ) as PerformanceNavigationTiming[];

  return navigationEntry?.type ?? 'navigate';
};

export const getExistingWindowId = () => {
  return sessionStorage.getItem(AUTH_STORAGE_KEYS.WINDOW_ID);
};

export const getWindowId = () => {
  const currentWindowId = getExistingWindowId();

  if (currentWindowId) {
    return currentWindowId;
  }

  const newWindowId =
    window.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  sessionStorage.setItem(AUTH_STORAGE_KEYS.WINDOW_ID, newWindowId);

  return newWindowId;
};

export const isPopupWindow = () => {
  const pathname = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();

  if (window.opener) {
    return true;
  }

  if (search.includes('popup=1') || search.includes('popup=true')) {
    return true;
  }

  return AUTH_POPUP_PATH_KEYWORDS.some((keyword) =>
    pathname.includes(keyword)
  );
};

export const readMainWindowsRegistry = (): MainWindowsRegistry => {
  try {
    const rawRegistry = localStorage.getItem(AUTH_STORAGE_KEYS.MAIN_WINDOWS);

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

export const writeMainWindowsRegistry = (
  registry: MainWindowsRegistry
) => {
  if (Object.keys(registry).length === 0) {
    localStorage.removeItem(AUTH_STORAGE_KEYS.MAIN_WINDOWS);
    return;
  }

  localStorage.setItem(
    AUTH_STORAGE_KEYS.MAIN_WINDOWS,
    JSON.stringify(registry)
  );
};

export const getCleanActiveRegistry = (
  registry: MainWindowsRegistry,
  now = Date.now()
): MainWindowsRegistry => {
  return Object.fromEntries(
    Object.entries(registry).filter(([, windowItem]) => {
      return (
        now - windowItem.lastSeen <=
        AUTH_WINDOW_TIMING.ACTIVE_WINDOW_TTL_MS
      );
    })
  );
};

export const registerMainWindow = (windowId: string) => {
  const now = Date.now();
  const registry = getCleanActiveRegistry(readMainWindowsRegistry(), now);

  registry[windowId] = {
    id: windowId,
    path: `${window.location.pathname}${window.location.search}`,
    lastSeen: now,
  };

  writeMainWindowsRegistry(registry);
};

export const readPendingLastMainLogout =
  (): PendingLastMainLogout | null => {
    try {
      const rawPendingLogout = localStorage.getItem(
        AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT
      );

      if (!rawPendingLogout) {
        return null;
      }

      return JSON.parse(rawPendingLogout) as PendingLastMainLogout;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT);
      return null;
    }
  };

export const requestLastMainWindowLogout = (closedWindowId: string) => {
  const pendingLogout: PendingLastMainLogout = {
    closedWindowId,
    requestedAt: Date.now(),
  };

  localStorage.setItem(
    AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT,
    JSON.stringify(pendingLogout)
  );
};

export const clearPendingLastMainLogout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT);
};

export const unregisterMainWindow = (
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
