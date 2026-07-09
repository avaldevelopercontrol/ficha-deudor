import { useCallback, useState } from 'react';

import { login as loginApi } from '../api';
import { AUTH_API_MESSAGES } from '../constants/authApi.constants';
import type { LoginPayload, LoginResponse } from '../types';
import { buildLoginErrorResponse } from '../utils/authResponse.utils';

interface UseLoginState {
  isLoading: boolean;
  error: string | null;
  data: LoginResponse | null;
}

const initialUseLoginState: UseLoginState = {
  isLoading: false,
  error: null,
  data: null,
};

export const useLogin = () => {
  const [state, setState] = useState<UseLoginState>(initialUseLoginState);

  const execute = useCallback(
    async (payload: LoginPayload): Promise<LoginResponse> => {
      setState({ isLoading: true, error: null, data: null });

      try {
        const response = await loginApi(payload);

        if (!response.success) {
          setState({
            isLoading: false,
            error: response.message,
            data: response,
          });
          return response;
        }

        setState({ isLoading: false, error: null, data: response });
        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : AUTH_API_MESSAGES.LOGIN_UNEXPECTED_ERROR;
        const errorResponse = buildLoginErrorResponse(message);

        setState({
          isLoading: false,
          error: message,
          data: errorResponse,
        });

        return errorResponse;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState(initialUseLoginState);
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
