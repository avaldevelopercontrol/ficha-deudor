import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { Cliente, LoginPayload, Usuario } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { AUTH_ROUTES } from '../../constants';

interface LoginLocationState {
  passwordChangedMessage?: string;
}

const getPasswordChangedMessage = (state: unknown): string | null => {
  if (typeof state !== 'object' || state === null) {
    return null;
  }

  const message = (state as LoginLocationState).passwordChangedMessage;

  return typeof message === 'string' && message.trim()
    ? message.trim()
    : null;
};

export const useLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    seleccionarCliente,
    expiredPasswordChallenge,
    clearExpiredPasswordChallenge,
    isLoading: authLoading,
    error: authError,
    clearError,
  } = useAuth();

  const [showClienteModal, setShowClienteModal] = useState(false);
  const [modalUser, setModalUser] = useState<Usuario | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(
    () => getPasswordChangedMessage(location.state)
  );

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      clearError();
      setLoginError(null);
      setLoginSuccessMessage(null);

      const response = await login(payload);

      if (response.cancelled) {
        return;
      }

      if (response.requiresPasswordChange) {
        setShowClienteModal(false);
        setModalUser(null);
        return;
      }

      if (!response.success || !response.usuario) {
        setLoginError(response.message || 'Usuario o contraseña incorrectos');
        return;
      }

      setModalUser(response.usuario);
      setShowClienteModal(true);
    },
    [login, clearError]
  );

  const handleSelectCliente = useCallback(
    (cliente: Cliente) => {
      seleccionarCliente(cliente);
      setShowClienteModal(false);

      navigate(AUTH_ROUTES.MENU_MODULOS, {
        replace: true,
      });
    },
    [seleccionarCliente, navigate]
  );

  const handleCloseModal = useCallback(() => {
    setShowClienteModal(false);
    setModalUser(null);
  }, []);

  const handleChangeExpiredPassword = useCallback(() => {
    navigate(AUTH_ROUTES.CAMBIAR_CLAVE_EXPIRADA);
  }, [navigate]);

  const handleCloseExpiredPasswordModal = useCallback(() => {
    clearExpiredPasswordChallenge();
  }, [clearExpiredPasswordChallenge]);

  const loginFormProps = useMemo(
    () => ({
      onSubmit: handleLogin,
      isLoading: authLoading,
      error: loginError || authError,
      successMessage: loginSuccessMessage,
    }),
    [
      handleLogin,
      authLoading,
      loginError,
      authError,
      loginSuccessMessage,
    ]
  );

  const clienteSelectorProps = useMemo(
    () => ({
      isOpen: showClienteModal,
      usuario: modalUser,
      onClose: handleCloseModal,
      onContinue: handleSelectCliente,
    }),
    [showClienteModal, modalUser, handleCloseModal, handleSelectCliente]
  );

  const expiredPasswordModalProps = useMemo(
    () => ({
      isOpen: expiredPasswordChallenge !== null,
      message: expiredPasswordChallenge?.message ?? '',
      onChangePassword: handleChangeExpiredPassword,
      onClose: handleCloseExpiredPasswordModal,
    }),
    [
      expiredPasswordChallenge,
      handleChangeExpiredPassword,
      handleCloseExpiredPasswordModal,
    ]
  );

  return {
    loginFormProps,
    clienteSelectorProps,
    expiredPasswordModalProps,
  };
};
