import { AUTH_WINDOW_TIMING } from '../constants/authWindow.constants';
import type {
  MainWindowsRegistry,
  PendingLastMainLogout,
} from './authWindowStorage';
import { getCleanActiveRegistry } from './authWindowStorage';

type PendingLastMainLogoutAction =
  | 'none'
  | 'cancel'
  | 'wait'
  | 'logout';

type ResolvePendingLastMainLogoutOptions = {
  pendingLogout: PendingLastMainLogout | null;
  registry: MainWindowsRegistry;
  now?: number;
  currentWindowId: string | null;
  allowSameWindowResume: boolean;
  waitGraceBeforeLogout: boolean;
};

type PendingLastMainLogoutResolution = {
  action: PendingLastMainLogoutAction;
  cleanRegistry: MainWindowsRegistry;
};

export const resolvePendingLastMainLogout = ({
  pendingLogout,
  registry,
  now = Date.now(),
  currentWindowId,
  allowSameWindowResume,
  waitGraceBeforeLogout,
}: ResolvePendingLastMainLogoutOptions): PendingLastMainLogoutResolution => {
  const cleanRegistry = getCleanActiveRegistry(registry, now);

  if (!pendingLogout) {
    return {
      action: 'none',
      cleanRegistry,
    };
  }

  if (Object.keys(cleanRegistry).length > 0) {
    return {
      action: 'cancel',
      cleanRegistry,
    };
  }

  const elapsedMs = Math.max(0, now - pendingLogout.requestedAt);
  const sameWindowResumed =
    allowSameWindowResume &&
    currentWindowId === pendingLogout.closedWindowId &&
    elapsedMs <= AUTH_WINDOW_TIMING.RELOAD_GRACE_MS;

  if (sameWindowResumed) {
    return {
      action: 'cancel',
      cleanRegistry,
    };
  }

  if (
    waitGraceBeforeLogout &&
    elapsedMs <= AUTH_WINDOW_TIMING.RELOAD_GRACE_MS
  ) {
    return {
      action: 'wait',
      cleanRegistry,
    };
  }

  return {
    action: 'logout',
    cleanRegistry,
  };
};


export const getPendingLastMainLogoutRetryDelay = (
  pendingLogout: PendingLastMainLogout | null,
  now = Date.now()
): number | null => {
  if (!pendingLogout) {
    return null;
  }

  const elapsedMs = Math.max(0, now - pendingLogout.requestedAt);

  if (elapsedMs > AUTH_WINDOW_TIMING.RELOAD_GRACE_MS) {
    return 0;
  }

  return AUTH_WINDOW_TIMING.RELOAD_GRACE_MS - elapsedMs + 1;
};

export const shouldUnregisterMainWindowOnPageHide = (
  persisted: boolean
): boolean => {
  return !persisted;
};
