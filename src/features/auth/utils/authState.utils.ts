import type {
  AuthState,
  Cliente,
  Usuario,
} from '../types';
import { hasAuthenticatedIdentity } from './authAccess.utils';

export const buildAuthenticatedUserState = (
  usuario: Usuario
): AuthState => ({
  isAuthenticated: true,
  usuario,
  clienteSeleccionada: null,
  isLoading: false,
  error: null,
});

export const buildRejectedLoginState = (
  message: string
): AuthState => ({
  isAuthenticated: false,
  usuario: null,
  clienteSeleccionada: null,
  isLoading: false,
  error: message,
});

export const selectAuthClient = (
  state: AuthState,
  cliente: Cliente
): AuthState => {
  if (!state.usuario) {
    return state;
  }

  return {
    ...state,
    isAuthenticated: true,
    clienteSeleccionada: cliente,
    isLoading: false,
    error: null,
  };
};

export const clearAuthStateError = (
  state: AuthState
): AuthState => {
  if (state.error === null) {
    return state;
  }

  return {
    ...state,
    error: null,
  };
};

export const resolveAuthContextState = (
  state: AuthState,
  isLoading: boolean,
  requestError: string | null
): AuthState => ({
  ...state,
  isAuthenticated: hasAuthenticatedIdentity(state),
  isLoading,
  error: requestError ?? state.error,
});
