import { useCallback, useMemo, useState } from 'react';

import { useAuthExternalSessionSync } from '../../hooks/useAuthExternalSessionSync';
import { useLoginRequest } from '../../hooks/useLoginRequest';
import type {
  AuthContextValue,
  AuthState,
  Cliente,
  LoginPayload,
  LoginResponse,
} from '../../types';
import {
  buildAuthenticatedUserState,
  buildLoginCancelledResponse,
  buildRejectedLoginState,
  clearAuthStateError,
  clearStoredAuthState,
  initialAuthState,
  loadStoredAuthState,
  resolveAuthContextState,
  saveStoredAuthState,
  selectAuthClient,
} from '../../utils';

export const useAuthProviderValue = (): AuthContextValue => {
  const [state, setState] = useState<AuthState>(() => loadStoredAuthState());
  const {
    isLoading: loginIsLoading,
    error: loginError,
    execute: executeLogin,
    reset: resetLogin,
    clearError: clearLoginError,
  } = useLoginRequest();

  useAuthExternalSessionSync(setState, resetLogin);

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResponse> => {
      const outcome = await executeLogin(payload);

      if (outcome.status === 'cancelled') {
        return buildLoginCancelledResponse();
      }

      const response = outcome.response;

      if (!response.success || !response.usuario) {
        clearStoredAuthState('manual');
        setState(buildRejectedLoginState(response.message));
        return response;
      }

      const nextState = buildAuthenticatedUserState(response.usuario);

      saveStoredAuthState(nextState);
      setState(nextState);

      return response;
    },
    [executeLogin]
  );

  const logout = useCallback(() => {
    resetLogin();
    clearStoredAuthState('manual');
    setState(initialAuthState);
  }, [resetLogin]);

  const seleccionarCliente = useCallback((cliente: Cliente) => {
    setState((currentState) => {
      const nextState = selectAuthClient(currentState, cliente);

      if (nextState !== currentState) {
        saveStoredAuthState(nextState);
      }

      return nextState;
    });
  }, []);

  const clearError = useCallback(() => {
    clearLoginError();

    setState((currentState) => {
      const nextState = clearAuthStateError(currentState);

      if (nextState !== currentState && nextState.usuario) {
        saveStoredAuthState(nextState);
      }

      return nextState;
    });
  }, [clearLoginError]);

  return useMemo(
    () => ({
      ...resolveAuthContextState(state, loginIsLoading, loginError),
      login,
      logout,
      seleccionarCliente,
      clearError,
    }),
    [
      state,
      loginIsLoading,
      loginError,
      login,
      logout,
      seleccionarCliente,
      clearError,
    ]
  );
};
