import {
  clearAccesoAnaliticaSession,
  clearSelectedCrmClientId,
} from '@features/gestion-analitica/acceso/session';
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
  clearAccesoAnaliticaSession();
  clearSelectedCrmClientId();
  clearStoredAuthState();
  broadcastAuthLogout('last-main-window-closed');
}
