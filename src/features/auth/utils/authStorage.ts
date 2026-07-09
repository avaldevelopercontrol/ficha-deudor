import {
  AUTH_LOGOUT_CUSTOM_EVENT,
  AUTH_STORAGE_KEYS,
} from '../constants/authStorage.constants';
import type { AuthState } from '../types';

export type AuthLogoutReason = 'manual' | 'last-main-window-closed';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  usuario: null,
  clienteSeleccionada: null,
  isLoading: false,
  error: null,
};

export function loadStoredAuthState(): AuthState {
  try {
    const rawState = localStorage.getItem(AUTH_STORAGE_KEYS.STATE);

    if (!rawState) {
      return initialAuthState;
    }

    const parsedState = JSON.parse(rawState) as Partial<AuthState>;

    if (!parsedState.usuario) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.STATE);
      return initialAuthState;
    }

    return {
      ...initialAuthState,
      isAuthenticated: true,
      usuario: parsedState.usuario,
      clienteSeleccionada: parsedState.clienteSeleccionada ?? null,
      isLoading: false,
      error: null,
    };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEYS.STATE);
    return initialAuthState;
  }
}

export function saveStoredAuthState(state: AuthState) {
  try {
    if (!state.usuario) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.STATE);
      return;
    }

    const stateToStore: AuthState = {
      ...state,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    localStorage.setItem(
      AUTH_STORAGE_KEYS.STATE,
      JSON.stringify(stateToStore)
    );
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEYS.STATE);
  }
}

export function clearStoredAuthState(
  reason: AuthLogoutReason = 'manual'
) {
  const logoutEvent = {
    reason,
    at: Date.now(),
  };

  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.STATE);

  localStorage.setItem(
    AUTH_STORAGE_KEYS.LOGOUT_EVENT,
    JSON.stringify(logoutEvent)
  );

  window.dispatchEvent(
    new CustomEvent(AUTH_LOGOUT_CUSTOM_EVENT, {
      detail: logoutEvent,
    })
  );
}

export function hasStoredAuthState(): boolean {
  return Boolean(localStorage.getItem(AUTH_STORAGE_KEYS.STATE));
}
