import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoginForm, ClienteSelectorModal } from '../components';
import { useAuth } from '../hooks';

import type { Cliente, LoginPayload, Usuario } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    login,
    seleccionarCliente,
    isLoading: authLoading,
    error: authError,
    clearError,
  } = useAuth();

  const [showClienteModal, setShowClienteModal] = useState(false);
  const [modalUser, setModalUser] = useState<Usuario | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      clearError();
      setLoginError(null);

      const response = await login(payload);

      if (!response.success || !response.usuario) {
        setLoginError(
          response.message || 'Usuario o contraseña incorrectos'
        );
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

      navigate(
        `/?id_cliente=${cliente.id_cliente}&id_usuario=${modalUser?.id_usuario}`,
        {
          replace: true,
        }
      );
    },
    [seleccionarCliente, navigate, modalUser]
  );

  const handleCloseModal = useCallback(() => {
    setShowClienteModal(false);
    setModalUser(null);
  }, []);

  const displayError = loginError || authError;
  const displayLoading = authLoading;

  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__brand">
          <span className="login-page__logo-text">AVAL</span>
          <span className="login-page__logo-sub">PERÚ</span>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          isLoading={displayLoading}
          error={displayError}
        />
      </div>

      {showClienteModal && modalUser && (
        <ClienteSelectorModal
          isOpen={true}
          usuario={modalUser}
          onClose={handleCloseModal}
          onContinue={handleSelectCliente}
        />
      )}
    </div>
  );
};

export default LoginPage;