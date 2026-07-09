import { useCallback, useMemo, useState } from 'react';

import { login as loginApi } from '../../api/authApi';
import { AUTH_API_MESSAGES } from '../../constants/authApi.constants';
import { useAuthExternalLogoutSync } from '../../hooks/useAuthExternalLogoutSync';
import type {
  AuthContextValue,
  AuthState,
  Cliente,
  LoginPayload,
  LoginResponse,
} from '../../types';
import {
  buildLoginErrorResponse,
  clearStoredAuthState,
  initialAuthState,
  loadStoredAuthState,
  saveStoredAuthState,
} from '../../utils';

export const useAuthProviderValue = (): AuthContextValue => {
  const [state, setState] = useState<AuthState>(() => loadStoredAuthState());

  useAuthExternalLogoutSync(setState);

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
          error instanceof Error
            ? error.message
            : AUTH_API_MESSAGES.LOGIN_UNEXPECTED_ERROR;

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

  return useMemo(
    () => ({
      ...state,
      login,
      logout,
      seleccionarCliente,
      clearError,
    }),
    [state, login, logout, seleccionarCliente, clearError]
  );
};
