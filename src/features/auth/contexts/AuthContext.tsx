import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AuthContext } from './authContextValue';
import { login as loginApi } from '../api/authApi';
import type {
  AuthContextValue,
  AuthState,
  Cliente,
  LoginPayload,
  LoginResponse,
} from '../types';
import {
  AUTH_LOGOUT_CUSTOM_EVENT,
  AUTH_LOGOUT_EVENT_KEY,
  AUTH_STORAGE_KEY,
  clearStoredAuthState,
  initialAuthState,
  loadStoredAuthState,
  saveStoredAuthState,
} from '../utils/authStorage';

interface AuthProviderProps {
  children: React.ReactNode;
}

const buildLoginErrorResponse = (message: string): LoginResponse => {
  return {
    success: false,
    message,
    usuario: null,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => loadStoredAuthState());

  useEffect(() => {
    const handleExternalLogout = () => {
      setState(initialAuthState);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_LOGOUT_EVENT_KEY) {
        setState(initialAuthState);
        return;
      }

      if (event.key === AUTH_STORAGE_KEY && event.newValue === null) {
        setState(initialAuthState);
      }
    };

    window.addEventListener(AUTH_LOGOUT_CUSTOM_EVENT, handleExternalLogout);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_LOGOUT_CUSTOM_EVENT, handleExternalLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResponse> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await loginApi(payload);

        if (!response.success || !response.usuario) {
          clearStoredAuthState('manual');

          setState((prev) => ({
            ...prev,
            isAuthenticated: false,
            usuario: null,
            clienteSeleccionada: null,
            isLoading: false,
            error: response.message,
          }));

          return response;
        }

        setState((prev) => {
          const nextState: AuthState = {
            ...prev,
            isAuthenticated: true,
            usuario: response.usuario,
            clienteSeleccionada: null,
            isLoading: false,
            error: null,
          };

          saveStoredAuthState(nextState);

          return nextState;
        });

        return response;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Error al iniciar sesión.';

        clearStoredAuthState('manual');

        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          usuario: null,
          clienteSeleccionada: null,
          isLoading: false,
          error: message,
        }));

        return buildLoginErrorResponse(message);
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredAuthState('manual');
    setState(initialAuthState);
  }, []);

  const seleccionarCliente = useCallback((cliente: Cliente) => {
    setState((prev) => {
      const nextState: AuthState = {
        ...prev,
        isAuthenticated: !!prev.usuario,
        clienteSeleccionada: cliente,
        isLoading: false,
        error: null,
      };

      saveStoredAuthState(nextState);

      return nextState;
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => {
      const nextState: AuthState = {
        ...prev,
        error: null,
      };

      if (nextState.usuario) {
        saveStoredAuthState(nextState);
      }

      return nextState;
    });
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      ...state,
      login,
      logout,
      seleccionarCliente,
      clearError,
    }),
    [state, login, logout, seleccionarCliente, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};