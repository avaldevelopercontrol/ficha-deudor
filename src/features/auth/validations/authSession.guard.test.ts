import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import {
  createAuthState,
  createCliente,
  createUsuario,
} from '../../../test/factories/auth.factory';
import {
  AUTH_STORAGE_TIMING,
  AUTH_STORAGE_VERSION,
} from '../constants/authStorage.constants';
import {
  buildStoredAuthSession,
  normalizeStoredCliente,
  normalizeStoredUsuario,
  parseStoredAuthSession,
} from './authSession.guard';

const NOW = 1_800_000_000_000;

export const suite = defineSuite('authSession.guard', [
  test('construye y recupera una sesión versionada normalizada', () => {
    const stored = buildStoredAuthSession(
      createAuthState({
        usuario: createUsuario({
          id_usuario: ' 16068 ',
          nombre: ' Carlos ',
          username: ' cramirez ',
        }),
        clienteSeleccionada: createCliente({
          id_cliente: ' 95 ',
          nombre: ' CLARO CORPORATIVO ',
        }),
        isLoading: true,
        error: 'Error temporal',
      }),
      NOW
    );

    const parsed = parseStoredAuthSession(JSON.stringify(stored), NOW);

    assert.equal(stored?.version, AUTH_STORAGE_VERSION);
    assert.equal(stored?.savedAt, NOW);
    assert.equal(parsed?.format, 'versioned');
    assert.equal(parsed?.state.usuario?.id_usuario, '16068');
    assert.equal(parsed?.state.usuario?.nombre, 'Carlos');
    assert.equal(parsed?.state.clienteSeleccionada?.id_cliente, '95');
    assert.equal(parsed?.state.isAuthenticated, true);
    assert.equal(parsed?.state.isLoading, false);
    assert.equal(parsed?.state.error, null);
  }),
  test('mantiene compatibilidad con la sesión anterior y deriva su estado', () => {
    const legacyState = createAuthState({
      isAuthenticated: false,
      isLoading: true,
      error: 'No debe restaurarse',
    });

    const parsed = parseStoredAuthSession(
      JSON.stringify(legacyState),
      NOW
    );

    assert.equal(parsed?.format, 'legacy');
    assert.equal(parsed?.state.isAuthenticated, true);
    assert.equal(parsed?.state.isLoading, false);
    assert.equal(parsed?.state.error, null);
  }),
  test('permite una identidad válida pendiente de seleccionar cliente', () => {
    const stored = buildStoredAuthSession(
      createAuthState({ clienteSeleccionada: null }),
      NOW
    );
    const parsed = parseStoredAuthSession(JSON.stringify(stored), NOW);

    assert.equal(parsed?.state.usuario?.id_usuario, '16068');
    assert.equal(parsed?.state.clienteSeleccionada, null);
  }),
  test('rechaza usuarios y clientes con identificadores o tipos inválidos', () => {
    assert.equal(
      normalizeStoredUsuario(createUsuario({ id_usuario: '0' })),
      null
    );
    assert.equal(
      normalizeStoredUsuario(createUsuario({ username: '   ' })),
      null
    );
    assert.equal(
      normalizeStoredUsuario({ ...createUsuario(), email: 123 }),
      null
    );
    assert.equal(
      normalizeStoredCliente(createCliente({ id_cliente: '-1' })),
      null
    );
    assert.equal(
      normalizeStoredCliente({ ...createCliente(), activa: 1 }),
      null
    );
  }),
  test('rechaza versiones desconocidas y fechas futuras anómalas', () => {
    const valid = buildStoredAuthSession(createAuthState(), NOW);

    assert.equal(
      parseStoredAuthSession(
        JSON.stringify({ ...valid, version: AUTH_STORAGE_VERSION + 1 }),
        NOW
      ),
      null
    );
    assert.equal(
      parseStoredAuthSession(
        JSON.stringify({
          ...valid,
          savedAt: NOW + AUTH_STORAGE_TIMING.MAX_FUTURE_SKEW_MS + 1,
        }),
        NOW
      ),
      null
    );
  }),
  test('rechaza sobres incompletos, contenido corrupto y fechas inválidas', () => {
    assert.equal(parseStoredAuthSession('{invalid', NOW), null);
    assert.equal(
      parseStoredAuthSession(
        JSON.stringify({ version: AUTH_STORAGE_VERSION, savedAt: NOW }),
        NOW
      ),
      null
    );
    assert.equal(buildStoredAuthSession(createAuthState(), 0), null);
  }),
]);
