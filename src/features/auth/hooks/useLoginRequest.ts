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
  const [controller] = useState(() =>
    createLoginRequestController(loginApi)
  );
  const isMountedRef = useRef(true);
  const [state, setState] = useState<LoginRequestState>(
    initialLoginRequestState
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      controller.cancel();
    };
  }, [controller]);

  const execute = useCallback(
    async (payload: LoginPayload): Promise<LoginRequestOutcome> => {
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
          error:
            outcome.response.success ||
            outcome.response.requiresPasswordChange
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
    [controller]
  );

  const cancel = useCallback(() => {
    controller.cancel();

    if (isMountedRef.current) {
      setState((current) =>
        current.isLoading
          ? {
              ...current,
              isLoading: false,
            }
          : current
      );
    }
  }, [controller]);

  const reset = useCallback(() => {
    controller.cancel();

    if (isMountedRef.current) {
      setState((current) =>
        current.isLoading || current.error !== null || current.data !== null
          ? initialLoginRequestState
          : current
      );
    }
  }, [controller]);

  const clearError = useCallback(() => {
    setState((current) =>
      current.error === null
        ? current
        : {
            ...current,
            error: null,
          }
    );
  }, []);

  return {
    ...state,
    execute,
    cancel,
    reset,
    clearError,
  };
};
