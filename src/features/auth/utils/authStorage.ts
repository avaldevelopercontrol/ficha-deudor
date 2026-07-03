import type { AuthState } from '../types';

export const AUTH_STORAGE_KEY = 'ficha_deudor_auth_state';
export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

export const AUTH_LOGOUT_EVENT_KEY = 'ficha_deudor_logout_event';
export const AUTH_LOGOUT_CUSTOM_EVENT = 'ficha-deudor:logout';

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
    const rawState = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawState) {
      return initialAuthState;
    }

    const parsedState = JSON.parse(rawState) as Partial<AuthState>;

    if (!parsedState.usuario) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
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
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return initialAuthState;
  }
}

export function saveStoredAuthState(state: AuthState) {
  try {
    if (!state.usuario) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    const stateToStore: AuthState = {
      ...state,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stateToStore));
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function clearStoredAuthState(reason: AuthLogoutReason = 'manual') {
  const logoutEvent = {
    reason,
    at: Date.now(),
  };

  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);

  localStorage.setItem(AUTH_LOGOUT_EVENT_KEY, JSON.stringify(logoutEvent));

  window.dispatchEvent(
    new CustomEvent(AUTH_LOGOUT_CUSTOM_EVENT, {
      detail: logoutEvent,
    })
  );
}