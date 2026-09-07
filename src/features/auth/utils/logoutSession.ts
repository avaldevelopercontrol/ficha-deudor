import { clearAnalyticsAccessSession } from '@features/analytics/access/services/analyticsAccess.prefetch';
import { clearSelectedCrmClientId } from '@features/analytics/access/store/analyticsCrmSelection.storage';
import { PUBLIC_AUTH_PATHS } from '../constants/authRoutes.constants';
import {
  broadcastAuthLogout,
  clearStoredAuthState,
} from './authStorage';

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.has(pathname);
}

export function closePopupOrRedirectToLogin(): void {
  const isPopupWindow = Boolean(window.opener);

  if (isPopupWindow) {
    window.close();

    window.setTimeout(() => {
      if (!window.closed) {
        window.location.replace('/login');
      }
    }, 100);

    return;
  }

  window.location.replace('/login');
}

export function logoutSession(): void {
  clearAnalyticsAccessSession();
  clearSelectedCrmClientId();
  clearStoredAuthState();
  broadcastAuthLogout('last-main-window-closed');
}
