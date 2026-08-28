import type { CarteraParametro, Cliente } from '../../../types';
import { buildClienteGrupoSelectionKey } from '../../../utils/clienteGrupo.utils';
import { buildCarteraParametroSelectionKey } from '../utils/carteraParametroSelection.utils';

export interface ClienteSelectorState {
  clientes: Cliente[];
  selectedClienteKey: string;
  anios: number[];
  selectedAnio: number | '';
  carteras: CarteraParametro[];
  selectedCarteraKey: string;
  isLoading: boolean;
  isAniosLoading: boolean;
  isCarterasLoading: boolean;
  hasLoadedAnios: boolean;
  hasLoadedCarteras: boolean;
  error: string | null;
  aniosError: string | null;
  carterasError: string | null;
}

export type ClienteSelectorAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; clientes: Cliente[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SELECT_CLIENTE'; clienteKey: string }
  | { type: 'LOAD_ANIOS_START' }
  | { type: 'LOAD_ANIOS_SUCCESS'; anios: number[] }
  | { type: 'LOAD_ANIOS_ERROR'; error: string }
  | { type: 'SELECT_ANIO'; anio: number | '' }
  | { type: 'LOAD_CARTERAS_START' }
  | { type: 'LOAD_CARTERAS_SUCCESS'; carteras: CarteraParametro[] }
  | { type: 'LOAD_CARTERAS_ERROR'; error: string }
  | { type: 'SELECT_CARTERA'; carteraKey: string }
  | { type: 'RESET' };

export const initialClienteSelectorState: ClienteSelectorState = {
  clientes: [],
  selectedClienteKey: '',
  anios: [],
  selectedAnio: '',
  carteras: [],
  selectedCarteraKey: '',
  isLoading: false,
  isAniosLoading: false,
  isCarterasLoading: false,
  hasLoadedAnios: false,
  hasLoadedCarteras: false,
  error: null,
  aniosError: null,
  carterasError: null,
};

const resetCarterasState = () => ({
  carteras: [],
  selectedCarteraKey: '',
  isCarterasLoading: false,
  hasLoadedCarteras: false,
  carterasError: null,
});

export function clienteSelectorReducer(
  state: ClienteSelectorState,
  action: ClienteSelectorAction
): ClienteSelectorState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...initialClienteSelectorState,
        isLoading: true,
      };

    case 'LOAD_SUCCESS':
      return {
        ...initialClienteSelectorState,
        clientes: action.clientes,
        selectedClienteKey:
          action.clientes.length === 1
            ? buildClienteGrupoSelectionKey(action.clientes[0])
            : '',
      };

    case 'LOAD_ERROR':
      return {
        ...initialClienteSelectorState,
        error: action.error,
      };

    case 'SELECT_CLIENTE':
      if (action.clienteKey === '') {
        return {
          ...state,
          selectedClienteKey: '',
          anios: [],
          selectedAnio: '',
          isAniosLoading: false,
          hasLoadedAnios: false,
          aniosError: null,
          ...resetCarterasState(),
        };
      }

      if (
        !state.clientes.some(
          (cliente) =>
            buildClienteGrupoSelectionKey(cliente) === action.clienteKey
        )
      ) {
        return state;
      }

      if (state.selectedClienteKey === action.clienteKey) {
        return state;
      }

      return {
        ...state,
        selectedClienteKey: action.clienteKey,
        anios: [],
        selectedAnio: '',
        isAniosLoading: false,
        hasLoadedAnios: false,
        aniosError: null,
        ...resetCarterasState(),
      };

    case 'LOAD_ANIOS_START':
      return {
        ...state,
        anios: [],
        selectedAnio: '',
        isAniosLoading: true,
        hasLoadedAnios: false,
        aniosError: null,
        ...resetCarterasState(),
      };

    case 'LOAD_ANIOS_SUCCESS':
      return {
        ...state,
        anios: action.anios,
        selectedAnio:
          action.anios.length === 1 ? action.anios[0] : '',
        isAniosLoading: false,
        hasLoadedAnios: true,
        aniosError: null,
        ...resetCarterasState(),
      };

    case 'LOAD_ANIOS_ERROR':
      return {
        ...state,
        anios: [],
        selectedAnio: '',
        isAniosLoading: false,
        hasLoadedAnios: false,
        aniosError: action.error,
        ...resetCarterasState(),
      };

    case 'SELECT_ANIO':
      if (action.anio === '') {
        return {
          ...state,
          selectedAnio: '',
          ...resetCarterasState(),
        };
      }

      if (!state.anios.includes(action.anio)) {
        return state;
      }

      if (state.selectedAnio === action.anio) {
        return state;
      }

      return {
        ...state,
        selectedAnio: action.anio,
        ...resetCarterasState(),
      };

    case 'LOAD_CARTERAS_START':
      return {
        ...state,
        carteras: [],
        selectedCarteraKey: '',
        isCarterasLoading: true,
        hasLoadedCarteras: false,
        carterasError: null,
      };

    case 'LOAD_CARTERAS_SUCCESS':
      return {
        ...state,
        carteras: action.carteras,
        selectedCarteraKey:
          action.carteras.length === 1
            ? buildCarteraParametroSelectionKey(action.carteras[0])
            : '',
        isCarterasLoading: false,
        hasLoadedCarteras: true,
        carterasError: null,
      };

    case 'LOAD_CARTERAS_ERROR':
      return {
        ...state,
        carteras: [],
        selectedCarteraKey: '',
        isCarterasLoading: false,
        hasLoadedCarteras: false,
        carterasError: action.error,
      };

    case 'SELECT_CARTERA':
      if (
        !state.carteras.some(
          (cartera) =>
            buildCarteraParametroSelectionKey(cartera) === action.carteraKey
        )
      ) {
        return state;
      }

      return {
        ...state,
        selectedCarteraKey: action.carteraKey,
      };

    case 'RESET':
      return initialClienteSelectorState;

    default:
      return state;
  }
}
