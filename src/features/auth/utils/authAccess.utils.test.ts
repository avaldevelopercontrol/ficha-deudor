import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import {
  createCliente,
  createUsuario,
} from '../../../test/factories/auth.factory';
import {
  hasAuthenticatedIdentity,
  hasPrivateRouteAccess,
  resolveAuthAccessStatus,
} from './authAccess.utils';

export const suite = defineSuite('authAccess.utils', [
  test('distingue sesión anónima, selección pendiente y acceso completo', () => {
    assert.equal(
      resolveAuthAccessStatus({
        usuario: null,
        clienteSeleccionada: null,
      }),
      'anonymous'
    );
    assert.equal(
      resolveAuthAccessStatus({
        usuario: createUsuario(),
        clienteSeleccionada: null,
      }),
      'pending-client'
    );
    assert.equal(
      resolveAuthAccessStatus({
        usuario: createUsuario(),
        clienteSeleccionada: createCliente(),
      }),
      'authenticated'
    );
  }),
  test('considera autenticada la identidad antes de elegir cliente', () => {
    assert.equal(
      hasAuthenticatedIdentity({
        usuario: createUsuario(),
        clienteSeleccionada: null,
      }),
      true
    );
    assert.equal(
      hasAuthenticatedIdentity({
        usuario: null,
        clienteSeleccionada: createCliente(),
      }),
      false
    );
  }),
  test('habilita rutas privadas únicamente con usuario y cliente', () => {
    assert.equal(
      hasPrivateRouteAccess({
        usuario: createUsuario(),
        clienteSeleccionada: createCliente(),
      }),
      true
    );
    assert.equal(
      hasPrivateRouteAccess({
        usuario: createUsuario(),
        clienteSeleccionada: null,
      }),
      false
    );
    assert.equal(
      hasPrivateRouteAccess({
        usuario: null,
        clienteSeleccionada: createCliente(),
      }),
      false
    );
  }),
]);
