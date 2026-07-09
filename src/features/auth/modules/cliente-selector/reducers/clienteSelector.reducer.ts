import type { Cliente } from '../../../types';

export interface ClienteSelectorState {
  clientes: Cliente[];
  selectedClienteId: string;
  isLoading: boolean;
  error: string | null;
}

export type ClienteSelectorAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; clientes: Cliente[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SELECT_CLIENTE'; clienteId: string }
  | { type: 'RESET' };

export const initialClienteSelectorState: ClienteSelectorState = {
  clientes: [],
  selectedClienteId: '',
  isLoading: false,
  error: null,
};

export function clienteSelectorReducer(
  state: ClienteSelectorState,
  action: ClienteSelectorAction
): ClienteSelectorState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        clientes: [],
        selectedClienteId: '',
        isLoading: true,
        error: null,
      };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        clientes: action.clientes,
        selectedClienteId:
          action.clientes.length === 1 ? action.clientes[0].id_cliente : '',
        isLoading: false,
        error: null,
      };

    case 'LOAD_ERROR':
      return {
        ...state,
        clientes: [],
        selectedClienteId: '',
        isLoading: false,
        error: action.error,
      };

    case 'SELECT_CLIENTE':
      return {
        ...state,
        selectedClienteId: action.clienteId,
      };

    case 'RESET':
      return initialClienteSelectorState;

    default:
      return state;
  }
}
