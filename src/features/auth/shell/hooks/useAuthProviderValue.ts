import { useCallback, useMemo, useState } from 'react';

import { useAuthExternalSessionSync } from '../../hooks/useAuthExternalSessionSync';
import { useLoginRequest } from '../../hooks/useLoginRequest';
import { AUTH_API_MESSAGES } from '../../constants/authApi.constants';
import type {
  AuthContextValue,
  AuthState,
  Cliente,
  LoginPayload,
  LoginResponse,
  ExpiredPasswordChallenge,
  PasswordExpiryWarning,
} from '../../types';
import {
  buildAuthenticatedUserState,
  buildExpiredPasswordChallenge,
  buildLoginCancelledResponse,
  buildLoginErrorResponse,
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
  const [expiredPasswordChallenge, setExpiredPasswordChallenge] =
    useState<ExpiredPasswordChallenge | null>(null);
  const [passwordExpiryWarning, setPasswordExpiryWarning] =
    useState<PasswordExpiryWarning | null>(null);
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

      if (response.requiresPasswordChange) {
        const challenge = buildExpiredPasswordChallenge(
          payload.username,
          response.message
        );

        clearStoredAuthState('manual');
        setPasswordExpiryWarning(null);

        if (!challenge) {
          const invalidResponse = buildLoginErrorResponse(
            AUTH_API_MESSAGES.LOGIN_INVALID_RESPONSE,
            response.code
          );

          setExpiredPasswordChallenge(null);
          setState(buildRejectedLoginState(invalidResponse.message));
          return invalidResponse;
        }

        setState(initialAuthState);
        setExpiredPasswordChallenge(challenge);
        return response;
      }

      setExpiredPasswordChallenge(null);

      if (!response.success || !response.usuario) {
        setPasswordExpiryWarning(null);
        clearStoredAuthState('manual');
        setState(buildRejectedLoginState(response.message));
        return response;
      }

      const nextState = buildAuthenticatedUserState(response.usuario);

      saveStoredAuthState(nextState);
      setState(nextState);
      setPasswordExpiryWarning(
        response.requiresPasswordChangeSoon
          ? { message: response.message }
          : null
      );

      return response;
    },
    [executeLogin]
  );

  const logout = useCallback(() => {
    resetLogin();
    clearStoredAuthState('manual');
    setExpiredPasswordChallenge(null);
    setPasswordExpiryWarning(null);
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

  const clearExpiredPasswordChallenge = useCallback(() => {
    setExpiredPasswordChallenge(null);
  }, []);

  const clearPasswordExpiryWarning = useCallback(() => {
    setPasswordExpiryWarning(null);
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
      expiredPasswordChallenge,
      passwordExpiryWarning,
      login,
      logout,
      seleccionarCliente,
      clearError,
      clearExpiredPasswordChallenge,
      clearPasswordExpiryWarning,
    }),
    [
      state,
      loginIsLoading,
      loginError,
      login,
      logout,
      seleccionarCliente,
      clearError,
      expiredPasswordChallenge,
      passwordExpiryWarning,
      clearExpiredPasswordChallenge,
      clearPasswordExpiryWarning,
    ]
  );
};
