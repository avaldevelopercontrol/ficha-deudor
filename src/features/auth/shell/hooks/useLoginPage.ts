import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Cliente, LoginPayload, Usuario } from '../../types';
import { useAuth } from '../../contexts/authContextValue';
import { AUTH_ROUTES } from '../../constants';

const buildGestionDeudorUrl = (
  cliente: Cliente,
  usuario: Usuario | null
): string => {
  const queryParams = new URLSearchParams({
    id_cliente: cliente.id_cliente,
  });

  if (usuario?.id_usuario) {
    queryParams.set('id_usuario', usuario.id_usuario);
  }

  return `${AUTH_ROUTES.MENU_MODULOS}?${queryParams.toString()}`;
};

export const useLoginPage = () => {
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

      navigate(buildGestionDeudorUrl(cliente, modalUser), {
        replace: true,
      });
    },
    [seleccionarCliente, navigate, modalUser]
  );

  const handleCloseModal = useCallback(() => {
    setShowClienteModal(false);
    setModalUser(null);
  }, []);

  const loginFormProps = useMemo(
    () => ({
      onSubmit: handleLogin,
      isLoading: authLoading,
      error: loginError || authError,
    }),
    [handleLogin, authLoading, loginError, authError]
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

  return {
    loginFormProps,
    clienteSelectorProps,
  };
};
