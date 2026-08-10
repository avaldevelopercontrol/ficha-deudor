import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { login as loginApi } from '../api';
import { AUTH_API_MESSAGES } from '../constants/authApi.constants';
import type { LoginPayload, LoginResponse } from '../types';
import {
  buildLoginErrorResponse,
  createLoginRequestController,
  type LoginRequestOutcome,
} from '../utils';

interface LoginRequestState {
  isLoading: boolean;
  error: string | null;
  data: LoginResponse | null;
}

const initialLoginRequestState: LoginRequestState = {
  isLoading: false,
  error: null,
  data: null,
};

export const useLoginRequest = () => {
  const controllerRef = useRef(
    createLoginRequestController(loginApi)
  );
  const isMountedRef = useRef(true);
  const [state, setState] = useState<LoginRequestState>(
    initialLoginRequestState
  );

  useEffect(() => {
    isMountedRef.current = true;
    const controller = controllerRef.current;

    return () => {
      isMountedRef.current = false;
      controller.cancel();
    };
  }, []);

  const execute = useCallback(
    async (payload: LoginPayload): Promise<LoginRequestOutcome> => {
      const controller = controllerRef.current;
      const wasPending = controller.isPending();

      if (!wasPending && isMountedRef.current) {
        setState({
          isLoading: true,
          error: null,
          data: null,
        });
      }

      try {
        const outcome = await controller.execute(payload);

        if (
          outcome.status === 'cancelled' ||
          !isMountedRef.current
        ) {
          return outcome;
        }

        setState({
          isLoading: false,
          error: outcome.response.success
            ? null
            : outcome.response.message,
          data: outcome.response,
        });

        return outcome;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : AUTH_API_MESSAGES.LOGIN_UNEXPECTED_ERROR;
        const response = buildLoginErrorResponse(message);

        if (isMountedRef.current) {
          setState({
            isLoading: false,
            error: message,
            data: response,
          });
        }

        return {
          status: 'completed',
          response,
        };
      }
    },
    []
  );

  const cancel = useCallback(() => {
    controllerRef.current.cancel();

    if (isMountedRef.current) {
      setState((current) => ({
        ...current,
        isLoading: false,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current.cancel();

    if (isMountedRef.current) {
      setState(initialLoginRequestState);
    }
  }, []);

  const clearError = useCallback(() => {
    setState((current) => ({
      ...current,
      error: null,
    }));
  }, []);

  return {
    ...state,
    execute,
    cancel,
    reset,
    clearError,
  };
};
