import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import { createCliente } from '../../../../../test/factories/auth.factory';
import {
  clienteSelectorReducer,
  initialClienteSelectorState,
} from './clienteSelector.reducer';

export const suite = defineSuite('clienteSelector.reducer', [
  test('reinicia datos anteriores al comenzar una carga', () => {
    const state = clienteSelectorReducer(
      {
        clientes: [createCliente()],
        selectedClienteId: '95',
        isLoading: false,
        error: 'Error anterior',
      },
      { type: 'LOAD_START' }
    );

    assert.deepEqual(state, {
      clientes: [],
      selectedClienteId: '',
      isLoading: true,
      error: null,
    });
  }),
  test('selecciona automáticamente cuando solo existe un cliente', () => {
    const cliente = createCliente();
    const state = clienteSelectorReducer(initialClienteSelectorState, {
      type: 'LOAD_SUCCESS',
      clientes: [cliente],
    });

    assert.equal(state.selectedClienteId, cliente.id_cliente);
    assert.deepEqual(state.clientes, [cliente]);
    assert.equal(state.isLoading, false);
  }),
  test('no selecciona automáticamente cuando existen varios clientes', () => {
    const state = clienteSelectorReducer(initialClienteSelectorState, {
      type: 'LOAD_SUCCESS',
      clientes: [
        createCliente({ id_cliente: '1' }),
        createCliente({ id_cliente: '2' }),
      ],
    });

    assert.equal(state.selectedClienteId, '');
  }),
  test('registra la selección y los errores de carga', () => {
    const loadedState = clienteSelectorReducer(
      initialClienteSelectorState,
      {
        type: 'LOAD_SUCCESS',
        clientes: [
          createCliente({ id_cliente: '94' }),
          createCliente({ id_cliente: '95' }),
        ],
      }
    );
    const selected = clienteSelectorReducer(loadedState, {
      type: 'SELECT_CLIENTE',
      clienteId: '95',
    });
    const failed = clienteSelectorReducer(selected, {
      type: 'LOAD_ERROR',
      error: 'No se pudieron cargar los clientes',
    });

    assert.equal(selected.selectedClienteId, '95');
    assert.deepEqual(failed, {
      clientes: [],
      selectedClienteId: '',
      isLoading: false,
      error: 'No se pudieron cargar los clientes',
    });
  }),
  test('ignora selecciones que no pertenecen a la lista cargada', () => {
    const loadedState = clienteSelectorReducer(
      initialClienteSelectorState,
      {
        type: 'LOAD_SUCCESS',
        clientes: [
          createCliente({ id_cliente: '94' }),
          createCliente({ id_cliente: '95' }),
        ],
      }
    );

    const state = clienteSelectorReducer(loadedState, {
      type: 'SELECT_CLIENTE',
      clienteId: '999',
    });

    assert.equal(state, loadedState);
    assert.equal(state.selectedClienteId, '');
  }),
  test('restaura el estado inicial al cerrar el selector', () => {
    const state = clienteSelectorReducer(
      {
        clientes: [createCliente()],
        selectedClienteId: '95',
        isLoading: true,
        error: 'Error',
      },
      { type: 'RESET' }
    );

    assert.deepEqual(state, initialClienteSelectorState);
  }),
]);
