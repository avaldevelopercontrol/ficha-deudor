import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { createAsyncResourceController } from '@shared/utils/asyncResource.utils';

import { fetchClientesByUsuario } from '../../../api';
import type { Cliente, ClientesResponse, Usuario } from '../../../types';
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
  const requestControllerRef = useRef(
    createAsyncResourceController<ClientesResponse>()
  );

  const { clientes, selectedClienteId, isLoading, error } = state;
  const usuarioId = usuario.id_usuario;

  useEffect(() => {
    const requestController = requestControllerRef.current;

    if (!isOpen) {
      requestController.cancel();
      dispatch({ type: 'RESET' });
      return;
    }

    dispatch({ type: 'LOAD_START' });

    void requestController
      .execute((signal) =>
        fetchClientesByUsuario(usuarioId, signal)
      )
      .then((result) => {
        if (result.status === 'aborted') {
          return;
        }

        if (result.status === 'error') {
          dispatch({
            type: 'LOAD_ERROR',
            error: CLIENTES_UNEXPECTED_ERROR_MESSAGE,
          });
          return;
        }

        if (!result.data.success) {
          dispatch({
            type: 'LOAD_ERROR',
            error: CLIENTES_LOAD_ERROR_MESSAGE,
          });
          return;
        }

        dispatch({
          type: 'LOAD_SUCCESS',
          clientes: result.data.clientes,
        });
      });

    return () => {
      requestController.cancel();
    };
  }, [isOpen, usuarioId]);

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
