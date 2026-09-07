import {
  AUTH_LOGOUT_CUSTOM_EVENT,
  AUTH_STORAGE_KEYS,
} from '../constants/authStorage.constants';
import type { AuthState } from '../types';
import {
  buildStoredAuthSession,
  parseStoredAuthSession,
} from '../validations/authSession.guard';

type AuthLogoutReason = 'manual' | 'last-main-window-closed';

interface AuthLogoutEvent {
  reason: AuthLogoutReason;
  at: number;
}

interface BroadcastAuthLogoutOptions {
  notifyCurrentWindow?: boolean;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  usuario: null,
  clienteSeleccionada: null,
  isLoading: false,
  error: null,
};

const removeStoredState = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.STATE);
  } catch {
    // El estado en memoria seguirá siendo la fuente segura de la sesión actual.
  }
};

export function loadStoredAuthState(): AuthState {
  try {
    const rawState = localStorage.getItem(AUTH_STORAGE_KEYS.STATE);
    const parsedSession = parseStoredAuthSession(rawState);

    if (!parsedSession) {
      if (rawState !== null) {
        removeStoredState();
      }

      return initialAuthState;
    }

    if (parsedSession.format === 'legacy') {
      saveStoredAuthState(parsedSession.state);
    }

    return parsedSession.state;
  } catch {
    removeStoredState();
    return initialAuthState;
  }
}

export function saveStoredAuthState(state: AuthState) {
  try {
    const storedSession = buildStoredAuthSession(state);

    if (!storedSession) {
      removeStoredState();
      return;
    }

    localStorage.setItem(
      AUTH_STORAGE_KEYS.STATE,
      JSON.stringify(storedSession)
    );
  } catch {
    removeStoredState();
  }
}

export function clearStoredAuthState(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.STATE);
  } catch {
    // El estado en memoria seguirá siendo la fuente segura de la sesión actual.
  }
}

export function broadcastAuthLogout(
  reason: AuthLogoutReason = 'manual',
  { notifyCurrentWindow = true }: BroadcastAuthLogoutOptions = {}
): AuthLogoutEvent {
  const logoutEvent: AuthLogoutEvent = {
    reason,
    at: Date.now(),
  };

  try {
    localStorage.setItem(
      AUTH_STORAGE_KEYS.LOGOUT_EVENT,
      JSON.stringify(logoutEvent)
    );
  } catch {
    // El evento local mantiene consistente la ventana que inició el cierre.
  }

  if (notifyCurrentWindow) {
    window.dispatchEvent(
      new CustomEvent(AUTH_LOGOUT_CUSTOM_EVENT, {
        detail: logoutEvent,
      })
    );
  }

  return logoutEvent;
}
