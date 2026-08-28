import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import { createCliente } from '../../../../../test/factories/auth.factory';
import { buildClienteGrupoSelectionKey } from '../../../utils/clienteGrupo.utils';
import {
  clienteSelectorReducer,
  initialClienteSelectorState,
} from './clienteSelector.reducer';

export const suite = defineSuite('clienteSelector.reducer', [
  test('reinicia datos anteriores al comenzar una carga', () => {
    const state = clienteSelectorReducer(
      {
        ...initialClienteSelectorState,
        clientes: [createCliente()],
        selectedClienteKey: '95:156',
        isLoading: false,
        error: 'Error anterior',
      },
      { type: 'LOAD_START' }
    );

    assert.deepEqual(state, {
      clientes: [],
      selectedClienteKey: '',
      anios: [],
      selectedAnio: '',
      carteras: [],
      selectedCarteraKey: '',
      isLoading: true,
      isAniosLoading: false,
      isCarterasLoading: false,
      hasLoadedAnios: false,
      hasLoadedCarteras: false,
      error: null,
      aniosError: null,
      carterasError: null,
    });
  }),
  test('selecciona automáticamente cuando solo existe una relación cliente-grupo', () => {
    const cliente = createCliente();
    const state = clienteSelectorReducer(initialClienteSelectorState, {
      type: 'LOAD_SUCCESS',
      clientes: [cliente],
    });

    assert.equal(
      state.selectedClienteKey,
      buildClienteGrupoSelectionKey(cliente)
    );
    assert.deepEqual(state.clientes, [cliente]);
    assert.equal(state.isLoading, false);
  }),
  test('no selecciona automáticamente cuando existen varias relaciones', () => {
    const state = clienteSelectorReducer(initialClienteSelectorState, {
      type: 'LOAD_SUCCESS',
      clientes: [
        createCliente({ id_cliente: '1', id_grupo: 10 }),
        createCliente({ id_cliente: '2', id_grupo: 20 }),
      ],
    });

    assert.equal(state.selectedClienteKey, '');
  }),
  test('registra la selección y los errores de carga', () => {
    const loadedState = clienteSelectorReducer(
      initialClienteSelectorState,
      {
        type: 'LOAD_SUCCESS',
        clientes: [
          createCliente({ id_cliente: '94', id_grupo: 155 }),
          createCliente({ id_cliente: '95', id_grupo: 156 }),
        ],
      }
    );
    const selected = clienteSelectorReducer(loadedState, {
      type: 'SELECT_CLIENTE',
      clienteKey: '95:156',
    });
    const failed = clienteSelectorReducer(selected, {
      type: 'LOAD_ERROR',
      error: 'No se pudieron cargar los clientes',
    });

    assert.equal(selected.selectedClienteKey, '95:156');
    assert.deepEqual(failed, {
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
      error: 'No se pudieron cargar los clientes',
      aniosError: null,
      carterasError: null,
    });
  }),
  test('distingue grupos diferentes del mismo cliente', () => {
    const loadedState = clienteSelectorReducer(
      initialClienteSelectorState,
      {
        type: 'LOAD_SUCCESS',
        clientes: [
          createCliente({ id_cliente: '27', id_grupo: 22 }),
          createCliente({ id_cliente: '27', id_grupo: 168 }),
        ],
      }
    );

    const selected = clienteSelectorReducer(loadedState, {
      type: 'SELECT_CLIENTE',
      clienteKey: '27:168',
    });

    assert.equal(selected.selectedClienteKey, '27:168');
  }),
  test('ignora selecciones que no pertenecen a la lista cargada', () => {
    const loadedState = clienteSelectorReducer(
      initialClienteSelectorState,
      {
        type: 'LOAD_SUCCESS',
        clientes: [
          createCliente({ id_cliente: '94', id_grupo: 155 }),
          createCliente({ id_cliente: '95', id_grupo: 156 }),
        ],
      }
    );

    const state = clienteSelectorReducer(loadedState, {
      type: 'SELECT_CLIENTE',
      clienteKey: '999:999',
    });

    assert.equal(state, loadedState);
    assert.equal(state.selectedClienteKey, '');
  }),
  test('restaura el estado inicial al cerrar el selector', () => {
    const state = clienteSelectorReducer(
      {
        ...initialClienteSelectorState,
        clientes: [createCliente()],
        selectedClienteKey: '95:156',
        isLoading: true,
        error: 'Error',
      },
      { type: 'RESET' }
    );

    assert.deepEqual(state, initialClienteSelectorState);
  }),
  test('reinicia el año cuando cambia o se limpia la relación cliente-grupo', () => {
    const loadedState = {
      ...initialClienteSelectorState,
      clientes: [
        createCliente({ id_cliente: '59', id_grupo: 194 }),
        createCliente({ id_cliente: '95', id_grupo: 156 }),
      ],
      selectedClienteKey: '59:194',
      anios: [2026, 2025],
      selectedAnio: 2026,
    };

    const changed = clienteSelectorReducer(loadedState, {
      type: 'SELECT_CLIENTE',
      clienteKey: '95:156',
    });
    const cleared = clienteSelectorReducer(changed, {
      type: 'SELECT_CLIENTE',
      clienteKey: '',
    });

    assert.equal(changed.selectedClienteKey, '95:156');
    assert.deepEqual(changed.anios, []);
    assert.equal(changed.selectedAnio, '');
    assert.equal(cleared.selectedClienteKey, '');
    assert.deepEqual(cleared.anios, []);
  }),
  test('carga y selecciona un año válido', () => {
    const loading = clienteSelectorReducer(
      initialClienteSelectorState,
      { type: 'LOAD_ANIOS_START' }
    );
    const loaded = clienteSelectorReducer(loading, {
      type: 'LOAD_ANIOS_SUCCESS',
      anios: [2026, 2025, 2024],
    });
    const selected = clienteSelectorReducer(loaded, {
      type: 'SELECT_ANIO',
      anio: 2025,
    });
    const invalid = clienteSelectorReducer(selected, {
      type: 'SELECT_ANIO',
      anio: 2023,
    });

    assert.equal(loading.isAniosLoading, true);
    assert.equal(loaded.isAniosLoading, false);
    assert.equal(loaded.selectedAnio, '');
    assert.equal(selected.selectedAnio, 2025);
    assert.equal(invalid, selected);
  }),
  test('marca la carga de años como resuelta aunque la API no devuelva registros', () => {
    const state = clienteSelectorReducer(initialClienteSelectorState, {
      type: 'LOAD_ANIOS_SUCCESS',
      anios: [],
    });

    assert.equal(state.hasLoadedAnios, true);
    assert.deepEqual(state.anios, []);
    assert.equal(state.selectedAnio, '');
  }),
  test('autoselecciona una cartera cuando solo existe una opción', () => {
    const state = clienteSelectorReducer(initialClienteSelectorState, {
      type: 'LOAD_CARTERAS_SUCCESS',
      carteras: [
        { campania: 1, anio: 2026, estado: 'Vigente', numero: 0 },
      ],
    });

    assert.equal(state.hasLoadedCarteras, true);
    assert.equal(state.selectedCarteraKey, '1:2026:0');
  }),
  test('exige selección explícita cuando existen varias carteras', () => {
    const carteras = [
      { campania: 8, anio: 2026, estado: 'Vigente', numero: 0 },
      { campania: 7, anio: 2026, estado: 'Vigente', numero: 0 },
    ];
    const loaded = clienteSelectorReducer(initialClienteSelectorState, {
      type: 'LOAD_CARTERAS_SUCCESS',
      carteras,
    });
    const selected = clienteSelectorReducer(loaded, {
      type: 'SELECT_CARTERA',
      carteraKey: '7:2026:0',
    });

    assert.equal(loaded.selectedCarteraKey, '');
    assert.equal(selected.selectedCarteraKey, '7:2026:0');
  }),
  test('selecciona automáticamente cuando la API devuelve un solo año', () => {
    const state = clienteSelectorReducer(
      initialClienteSelectorState,
      {
        type: 'LOAD_ANIOS_SUCCESS',
        anios: [2026],
      }
    );

    assert.equal(state.selectedAnio, 2026);
  }),
]);
