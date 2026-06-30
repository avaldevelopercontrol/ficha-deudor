import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';

import type {
  AuthContextValue,
  AuthState,
  Cliente,
  LoginPayload,
  LoginResponse,
} from '../types';

const initialState: AuthState = {
  isAuthenticated: false,
  usuario: null,
  clienteSeleccionada: null,
  isLoading: false,
  error: null,
};

export const AuthContext = createContext<AuthContextValue | null>(null);

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
  const [state, setState] = useState<AuthState>(initialState);

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResponse> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const { login: loginApi } = await import('../api/authApi');

        const response = await loginApi(payload);

        if (!response.success || !response.usuario) {
          setState((prev) => ({
            ...prev,
            isAuthenticated: false,
            usuario: null,
            isLoading: false,
            error: response.message,
          }));

          return response;
        }

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          usuario: response.usuario,
          isLoading: false,
          error: null,
        }));

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Error al iniciar sesión.';

        setState((prev) => ({
          ...prev,
          isAuthenticated: false,
          usuario: null,
          isLoading: false,
          error: message,
        }));

        return buildLoginErrorResponse(message);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setState(initialState);
    localStorage.removeItem('auth_token');
  }, []);

  const seleccionarCliente = useCallback((cliente: Cliente) => {
    setState((prev) => ({
      ...prev,
      clienteSeleccionada: cliente,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      seleccionarCliente,
      clearError,
    }),
    [state, login, logout, seleccionarCliente, clearError]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};