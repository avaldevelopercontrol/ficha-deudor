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

const WINDOW_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;
const MAX_WINDOW_PATH_LENGTH = 2048;

let volatileWindowId: string | null = null;
let volatileWindowOwner: Window | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isValidWindowId = (value: unknown): value is string => {
  return typeof value === 'string' && WINDOW_ID_PATTERN.test(value);
};

const isValidTimestamp = (value: unknown): value is number => {
  return Number.isInteger(value) && Number.isFinite(value) && Number(value) > 0;
};

const normalizeMainWindowItem = (
  registryKey: string,
  value: unknown
): MainWindowItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { id, path, lastSeen } = value;

  if (
    !isValidWindowId(registryKey) ||
    !isValidWindowId(id) ||
    registryKey !== id ||
    typeof path !== 'string' ||
    !path.startsWith('/') ||
    path.length > MAX_WINDOW_PATH_LENGTH ||
    !isValidTimestamp(lastSeen)
  ) {
    return null;
  }

  return {
    id,
    path,
    lastSeen,
  };
};

const normalizeMainWindowsRegistry = (
  value: unknown
): MainWindowsRegistry => {
  if (!isRecord(value)) {
    return {};
  }

  const registry: MainWindowsRegistry = {};

  Object.entries(value).forEach(([registryKey, windowItem]) => {
    const normalizedItem = normalizeMainWindowItem(registryKey, windowItem);

    if (normalizedItem) {
      registry[registryKey] = normalizedItem;
    }
  });

  return registry;
};

const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeLocalStorageRemove = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const safeSessionStorageGet = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSessionStorageSet = (key: string, value: string): boolean => {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeSessionStorageRemove = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // La ventana conserva un identificador volátil cuando storage no está disponible.
  }
};

export const getNavigationType = () => {
  try {
    const [navigationEntry] = performance.getEntriesByType(
      'navigation'
    ) as PerformanceNavigationTiming[];

    return navigationEntry?.type ?? 'navigate';
  } catch {
    return 'navigate';
  }
};

export const getExistingWindowId = () => {
  const storedWindowId = safeSessionStorageGet(AUTH_STORAGE_KEYS.WINDOW_ID);

  if (isValidWindowId(storedWindowId)) {
    volatileWindowId = storedWindowId;
    volatileWindowOwner = window;
    return storedWindowId;
  }

  if (storedWindowId !== null) {
    safeSessionStorageRemove(AUTH_STORAGE_KEYS.WINDOW_ID);
  }

  return volatileWindowOwner === window ? volatileWindowId : null;
};

export const getWindowId = () => {
  const currentWindowId = getExistingWindowId();

  if (currentWindowId) {
    return currentWindowId;
  }

  const generatedWindowId =
    window.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const newWindowId = isValidWindowId(generatedWindowId)
    ? generatedWindowId
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  volatileWindowId = newWindowId;
  volatileWindowOwner = window;
  safeSessionStorageSet(AUTH_STORAGE_KEYS.WINDOW_ID, newWindowId);

  return newWindowId;
};

export const isPopupWindow = () => {
  try {
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
  } catch {
    return false;
  }
};

export const readMainWindowsRegistry = (): MainWindowsRegistry => {
  const rawRegistry = safeLocalStorageGet(AUTH_STORAGE_KEYS.MAIN_WINDOWS);

  if (!rawRegistry) {
    return {};
  }

  try {
    return normalizeMainWindowsRegistry(JSON.parse(rawRegistry));
  } catch {
    safeLocalStorageRemove(AUTH_STORAGE_KEYS.MAIN_WINDOWS);
    return {};
  }
};

export const writeMainWindowsRegistry = (
  registry: MainWindowsRegistry
) => {
  const normalizedRegistry = normalizeMainWindowsRegistry(registry);

  if (Object.keys(normalizedRegistry).length === 0) {
    return safeLocalStorageRemove(AUTH_STORAGE_KEYS.MAIN_WINDOWS);
  }

  return safeLocalStorageSet(
    AUTH_STORAGE_KEYS.MAIN_WINDOWS,
    JSON.stringify(normalizedRegistry)
  );
};

export const getCleanActiveRegistry = (
  registry: MainWindowsRegistry,
  now = Date.now()
): MainWindowsRegistry => {
  const normalizedRegistry = normalizeMainWindowsRegistry(registry);

  return Object.fromEntries(
    Object.entries(normalizedRegistry).filter(([, windowItem]) => {
      const elapsedMs = now - windowItem.lastSeen;

      return (
        elapsedMs <= AUTH_WINDOW_TIMING.ACTIVE_WINDOW_TTL_MS &&
        elapsedMs >= -AUTH_WINDOW_TIMING.MAX_FUTURE_SKEW_MS
      );
    })
  );
};

export const registerMainWindow = (windowId: string) => {
  if (!isValidWindowId(windowId)) {
    return false;
  }

  const now = Date.now();
  const registry = getCleanActiveRegistry(readMainWindowsRegistry(), now);
  let path = '/';

  try {
    path = `${window.location.pathname}${window.location.search}`;
  } catch {
    // Se conserva una ruta segura cuando location no está disponible.
  }

  registry[windowId] = {
    id: windowId,
    path: path.startsWith('/') ? path.slice(0, MAX_WINDOW_PATH_LENGTH) : '/',
    lastSeen: now,
  };

  return writeMainWindowsRegistry(registry);
};

const normalizePendingLastMainLogout = (
  value: unknown,
  now = Date.now()
): PendingLastMainLogout | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { closedWindowId, requestedAt } = value;

  if (
    !isValidWindowId(closedWindowId) ||
    !isValidTimestamp(requestedAt) ||
    requestedAt > now + AUTH_WINDOW_TIMING.MAX_FUTURE_SKEW_MS
  ) {
    return null;
  }

  return {
    closedWindowId,
    requestedAt,
  };
};

export const readPendingLastMainLogout =
  (): PendingLastMainLogout | null => {
    const rawPendingLogout = safeLocalStorageGet(
      AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT
    );

    if (!rawPendingLogout) {
      return null;
    }

    try {
      const pendingLogout = normalizePendingLastMainLogout(
        JSON.parse(rawPendingLogout)
      );

      if (!pendingLogout) {
        safeLocalStorageRemove(AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT);
      }

      return pendingLogout;
    } catch {
      safeLocalStorageRemove(AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT);
      return null;
    }
  };

export const requestLastMainWindowLogout = (closedWindowId: string) => {
  if (!isValidWindowId(closedWindowId)) {
    return false;
  }

  const pendingLogout: PendingLastMainLogout = {
    closedWindowId,
    requestedAt: Date.now(),
  };

  return safeLocalStorageSet(
    AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT,
    JSON.stringify(pendingLogout)
  );
};

export const clearPendingLastMainLogout = () => {
  return safeLocalStorageRemove(AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT);
};

export const unregisterMainWindow = (
  windowId: string,
  shouldLogoutIfLastMainWindow: boolean
) => {
  if (!isValidWindowId(windowId)) {
    return false;
  }

  const registry = getCleanActiveRegistry(readMainWindowsRegistry());

  delete registry[windowId];

  writeMainWindowsRegistry(registry);

  if (!shouldLogoutIfLastMainWindow) {
    return true;
  }

  if (Object.keys(registry).length === 0) {
    return requestLastMainWindowLogout(windowId);
  }

  return true;
};
