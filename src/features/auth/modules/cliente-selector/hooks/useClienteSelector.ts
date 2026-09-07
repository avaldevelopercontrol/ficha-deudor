import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { createAsyncResourceController } from '@shared/utils/asyncResource.utils';

import {
  fetchAniosByCliente,
  fetchCarterasParametrosByClienteAnio,
  fetchGruposClienteInicial,
} from '../../../api';
import type { CarteraParametro, Cliente } from '../../../types';
import { buildClienteGrupoSelectionKey } from '../../../utils/clienteGrupo.utils';
import {
  clienteSelectorReducer,
  initialClienteSelectorState,
} from '../reducers/clienteSelector.reducer';
import { buildCarteraParametroSelectionKey } from '../utils/carteraParametroSelection.utils';
import { canContinueClienteSelector } from '../utils/clienteSelectorFlow.utils';

const CLIENTES_UNEXPECTED_ERROR_MESSAGE = 'Error al cargar clientes';
const ANIOS_UNEXPECTED_ERROR_MESSAGE = 'Error al cargar años';
const CARTERAS_UNEXPECTED_ERROR_MESSAGE = 'Error al cargar carteras';

interface UseClienteSelectorParams {
  isOpen: boolean;
  usuarioId: string;
  onContinue: (cliente: Cliente) => void;
}

export const useClienteSelector = ({
  isOpen,
  usuarioId,
  onContinue,
}: UseClienteSelectorParams) => {
  const [state, dispatch] = useReducer(
    clienteSelectorReducer,
    initialClienteSelectorState
  );
  const [clientesRequestController] = useState(() =>
    createAsyncResourceController<Cliente[]>()
  );
  const [aniosRequestController] = useState(() =>
    createAsyncResourceController<number[]>()
  );
  const [carterasRequestController] = useState(() =>
    createAsyncResourceController<CarteraParametro[]>()
  );

  const {
    clientes,
    selectedClienteKey,
    anios,
    selectedAnio,
    carteras,
    selectedCarteraKey,
    isLoading,
    isAniosLoading,
    isCarterasLoading,
    hasLoadedAnios,
    hasLoadedCarteras,
    error,
    aniosError,
    carterasError,
  } = state;

  useEffect(() => {
    if (!isOpen) {
      clientesRequestController.cancel();
      aniosRequestController.cancel();
      carterasRequestController.cancel();
      dispatch({ type: 'RESET' });
      return;
    }

    // Un cambio de usuario invalida inmediatamente todo el contexto derivado.
    aniosRequestController.cancel();
    carterasRequestController.cancel();
    dispatch({ type: 'LOAD_START' });

    void clientesRequestController
      .execute((signal) => fetchGruposClienteInicial(usuarioId, signal))
      .then((result) => {
        if (result.status === 'aborted') {
          return;
        }

        if (result.status === 'error') {
          dispatch({
            type: 'LOAD_ERROR',
            error:
              result.error instanceof Error
                ? result.error.message
                : CLIENTES_UNEXPECTED_ERROR_MESSAGE,
          });
          return;
        }

        dispatch({
          type: 'LOAD_SUCCESS',
          clientes: result.data,
        });
      });

    return () => {
      clientesRequestController.cancel();
    };
  }, [
    aniosRequestController,
    carterasRequestController,
    clientesRequestController,
    isOpen,
    usuarioId,
  ]);

  const selectedCliente = useMemo(
    () =>
      clientes.find(
        (cliente) =>
          buildClienteGrupoSelectionKey(cliente) === selectedClienteKey
      ),
    [clientes, selectedClienteKey]
  );

  useEffect(() => {
    if (!isOpen || !selectedCliente) {
      aniosRequestController.cancel();
      carterasRequestController.cancel();
      return;
    }

    // Una nueva relación cliente-grupo invalida cualquier cartera pendiente.
    carterasRequestController.cancel();
    dispatch({ type: 'LOAD_ANIOS_START' });

    void aniosRequestController
      .execute((signal) =>
        fetchAniosByCliente(selectedCliente.id_cliente, signal)
      )
      .then((result) => {
        if (result.status === 'aborted') {
          return;
        }

        if (result.status === 'error') {
          dispatch({
            type: 'LOAD_ANIOS_ERROR',
            error:
              result.error instanceof Error
                ? result.error.message
                : ANIOS_UNEXPECTED_ERROR_MESSAGE,
          });
          return;
        }

        dispatch({
          type: 'LOAD_ANIOS_SUCCESS',
          anios: result.data,
        });
      });

    return () => {
      aniosRequestController.cancel();
    };
  }, [
    aniosRequestController,
    carterasRequestController,
    isOpen,
    selectedCliente,
  ]);

  useEffect(() => {
    if (!isOpen || !selectedCliente || selectedAnio === '') {
      carterasRequestController.cancel();
      return;
    }

    dispatch({ type: 'LOAD_CARTERAS_START' });

    void carterasRequestController
      .execute((signal) =>
        fetchCarterasParametrosByClienteAnio(
          selectedCliente.id_cliente,
          selectedAnio,
          signal
        )
      )
      .then((result) => {
        if (result.status === 'aborted') {
          return;
        }

        if (result.status === 'error') {
          dispatch({
            type: 'LOAD_CARTERAS_ERROR',
            error:
              result.error instanceof Error
                ? result.error.message
                : CARTERAS_UNEXPECTED_ERROR_MESSAGE,
          });
          return;
        }

        dispatch({
          type: 'LOAD_CARTERAS_SUCCESS',
          carteras: result.data,
        });
      });

    return () => {
      carterasRequestController.cancel();
    };
  }, [
    carterasRequestController,
    isOpen,
    selectedAnio,
    selectedCliente,
  ]);

  const selectedCartera = useMemo(
    () =>
      carteras.find(
        (cartera) =>
          buildCarteraParametroSelectionKey(cartera) ===
          selectedCarteraKey
      ) ?? null,
    [carteras, selectedCarteraKey]
  );

  const canContinue = useMemo(
    () =>
      canContinueClienteSelector({
        hasSelectedCliente: Boolean(selectedCliente),
        anios,
        selectedAnio,
        carteras,
        hasSelectedCartera: selectedCartera !== null,
        isLoading,
        isAniosLoading,
        isCarterasLoading,
        hasLoadedAnios,
        hasLoadedCarteras,
        aniosError,
        carterasError,
      }),
    [
      anios,
      aniosError,
      carteras,
      carterasError,
      hasLoadedAnios,
      hasLoadedCarteras,
      isAniosLoading,
      isCarterasLoading,
      isLoading,
      selectedAnio,
      selectedCartera,
      selectedCliente,
    ]
  );

  const handleContinue = useCallback(() => {
    if (selectedCliente && canContinue) {
      onContinue(selectedCliente);
    }
  }, [canContinue, selectedCliente, onContinue]);

  const handleSelectCliente = useCallback((clienteKey: string) => {
    dispatch({
      type: 'SELECT_CLIENTE',
      clienteKey,
    });
  }, []);

  const handleSelectAnio = useCallback((anio: number | '') => {
    dispatch({
      type: 'SELECT_ANIO',
      anio,
    });
  }, []);

  const handleSelectCartera = useCallback((carteraKey: string) => {
    dispatch({
      type: 'SELECT_CARTERA',
      carteraKey,
    });
  }, []);

  return {
    clientes,
    selectedClienteKey,
    anios,
    selectedAnio,
    carteras,
    selectedCartera,
    selectedCarteraKey,
    isLoading,
    isAniosLoading,
    isCarterasLoading,
    hasLoadedAnios,
    hasLoadedCarteras,
    error,
    aniosError,
    carterasError,
    canContinue,
    handleContinue,
    handleSelectCliente,
    handleSelectAnio,
    handleSelectCartera,
  };
};
