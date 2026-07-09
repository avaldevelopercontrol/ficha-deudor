import { PUBLIC_AUTH_PATHS } from '../constants/authRoutes.constants';
import { AUTH_STORAGE_KEYS } from '../constants/authStorage.constants';
import { clearStoredAuthState } from './authStorage';

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.has(pathname);
}

export function notifyGlobalLogout(): void {
  localStorage.setItem(
    AUTH_STORAGE_KEYS.LOGOUT_EVENT,
    `${Date.now()}-${Math.random()}`
  );
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
  clearStoredAuthState('last-main-window-closed');
  notifyGlobalLogout();
}
