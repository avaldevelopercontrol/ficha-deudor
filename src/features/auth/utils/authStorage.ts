import {
  AUTH_LOGOUT_CUSTOM_EVENT,
  AUTH_STORAGE_KEYS,
} from '../constants/authStorage.constants';
import type { AuthState } from '../types';
import {
  buildStoredAuthSession,
  parseStoredAuthSession,
} from '../validations/authSession.guard';

export type AuthLogoutReason = 'manual' | 'last-main-window-closed';

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

export function clearStoredAuthState(
  reason: AuthLogoutReason = 'manual'
) {
  const logoutEvent = {
    reason,
    at: Date.now(),
  };

  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.STATE);
    localStorage.setItem(
      AUTH_STORAGE_KEYS.LOGOUT_EVENT,
      JSON.stringify(logoutEvent)
    );
  } catch {
    // El evento local garantiza que el proveedor actual cierre la sesión.
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_LOGOUT_CUSTOM_EVENT, {
      detail: logoutEvent,
    })
  );
}

export function hasStoredAuthState(): boolean {
  try {
    const rawState = localStorage.getItem(AUTH_STORAGE_KEYS.STATE);
    const parsedSession = parseStoredAuthSession(rawState);

    if (!parsedSession && rawState !== null) {
      removeStoredState();
    }

    return Boolean(parsedSession);
  } catch {
    removeStoredState();
    return false;
  }
}
