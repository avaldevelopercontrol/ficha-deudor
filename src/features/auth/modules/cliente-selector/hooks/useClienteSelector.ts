import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { fetchClientesByUsuario } from '../../../api';
import type { Cliente, Usuario } from '../../../types';
import {
  clienteSelectorReducer,
  initialClienteSelectorState,
} from '../reducers/clienteSelector.reducer';

const CLIENTES_LOAD_ERROR_MESSAGE = 'No se pudieron cargar los clientes';
const CLIENTES_UNEXPECTED_ERROR_MESSAGE = 'Error al cargar clientes';

interface UseClienteSelectorParams {
  isOpen: boolean;
  usuario: Usuario;
  onContinue: (cliente: Cliente) => void;
}

export const useClienteSelector = ({
  isOpen,
  usuario,
  onContinue,
}: UseClienteSelectorParams) => {
  const [state, dispatch] = useReducer(
    clienteSelectorReducer,
    initialClienteSelectorState
  );

  const { clientes, selectedClienteId, isLoading, error } = state;

  useEffect(() => {
    if (!isOpen || !usuario) {
      dispatch({ type: 'RESET' });
      return;
    }

    let isMounted = true;

    const loadClientes = async () => {
      dispatch({ type: 'LOAD_START' });

      try {
        const response = await fetchClientesByUsuario(usuario.id_usuario);

        if (!isMounted) {
          return;
        }

        if (response.success) {
          dispatch({
            type: 'LOAD_SUCCESS',
            clientes: response.clientes,
          });
          return;
        }

        dispatch({
          type: 'LOAD_ERROR',
          error: CLIENTES_LOAD_ERROR_MESSAGE,
        });
      } catch {
        if (!isMounted) {
          return;
        }

        dispatch({
          type: 'LOAD_ERROR',
          error: CLIENTES_UNEXPECTED_ERROR_MESSAGE,
        });
      }
    };

    void loadClientes();

    return () => {
      isMounted = false;
    };
  }, [isOpen, usuario]);

  const selectedCliente = useMemo(
    () => clientes.find((cliente) => cliente.id_cliente === selectedClienteId),
    [clientes, selectedClienteId]
  );

  const handleContinue = useCallback(() => {
    if (selectedCliente) {
      onContinue(selectedCliente);
    }
  }, [selectedCliente, onContinue]);

  const handleSelectCliente = useCallback((clienteId: string) => {
    dispatch({
      type: 'SELECT_CLIENTE',
      clienteId,
    });
  }, []);

  return {
    clientes,
    selectedCliente,
    selectedClienteId,
    isLoading,
    error,
    handleContinue,
    handleSelectCliente,
  };
};
