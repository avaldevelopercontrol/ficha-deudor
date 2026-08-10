import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import {
  createAuthState,
  createCliente,
  createUsuario,
} from '../../../test/factories/auth.factory';
import {
  buildAuthenticatedUserState,
  buildRejectedLoginState,
  clearAuthStateError,
  resolveAuthContextState,
  selectAuthClient,
} from './authState.utils';

export const suite = defineSuite('authState.utils', [
  test('construye estados completos para login correcto y rechazado', () => {
    const usuario = createUsuario();

    assert.deepEqual(buildAuthenticatedUserState(usuario), {
      isAuthenticated: true,
      usuario,
      clienteSeleccionada: null,
      isLoading: false,
      error: null,
    });
    assert.deepEqual(buildRejectedLoginState('Acceso denegado'), {
      isAuthenticated: false,
      usuario: null,
      clienteSeleccionada: null,
      isLoading: false,
      error: 'Acceso denegado',
    });
  }),
  test('selecciona cliente únicamente cuando existe usuario autenticado', () => {
    const cliente = createCliente();
    const authenticated = createAuthState({
      clienteSeleccionada: null,
      error: 'Anterior',
    });
    const anonymous = createAuthState({
      isAuthenticated: false,
      usuario: null,
      clienteSeleccionada: null,
    });

    assert.deepEqual(selectAuthClient(authenticated, cliente), {
      ...authenticated,
      isAuthenticated: true,
      clienteSeleccionada: cliente,
      isLoading: false,
      error: null,
    });
    assert.equal(selectAuthClient(anonymous, cliente), anonymous);
  }),
  test('limpia errores sin crear un estado nuevo cuando no es necesario', () => {
    const withError = createAuthState({ error: 'Error anterior' });
    const withoutError = createAuthState({ error: null });

    assert.deepEqual(clearAuthStateError(withError), {
      ...withError,
      error: null,
    });
    assert.equal(clearAuthStateError(withoutError), withoutError);
  }),
  test('deriva autenticación y estado de solicitud desde una sola identidad', () => {
    const inconsistent = createAuthState({
      isAuthenticated: true,
      usuario: null,
      clienteSeleccionada: createCliente(),
      error: 'Persistido',
    });

    assert.deepEqual(
      resolveAuthContextState(inconsistent, true, 'Solicitud fallida'),
      {
        ...inconsistent,
        isAuthenticated: false,
        isLoading: true,
        error: 'Solicitud fallida',
      }
    );
  }),
]);
