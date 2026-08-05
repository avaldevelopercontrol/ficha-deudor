import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import { createAuthState } from '../../../test/factories/auth.factory';
import { AUTH_STORAGE_KEYS } from '../constants/authStorage.constants';
import { buildStoredAuthSession } from '../validations/authSession.guard';
import { resolveAuthStorageSyncAction } from './authSessionSync.utils';

const NOW = 1_800_000_000_000;

export const suite = defineSuite('authSessionSync.utils', [
  test('restaura una sesión válida modificada desde otra ventana', () => {
    const stored = buildStoredAuthSession(createAuthState(), NOW);
    const action = resolveAuthStorageSyncAction(
      AUTH_STORAGE_KEYS.STATE,
      JSON.stringify(stored),
      NOW
    );

    assert.equal(action.type, 'restore');

    if (action.type === 'restore') {
      assert.equal(action.state.usuario?.id_usuario, '16068');
      assert.equal(action.state.clienteSeleccionada?.id_cliente, '95');
    }
  }),
  test('reinicia la sesión cuando otra ventana elimina el estado', () => {
    assert.deepEqual(
      resolveAuthStorageSyncAction(AUTH_STORAGE_KEYS.STATE, null, NOW),
      {
        type: 'reset',
        removeInvalidState: false,
      }
    );
  }),
  test('reinicia y solicita limpiar un estado externo manipulado', () => {
    assert.deepEqual(
      resolveAuthStorageSyncAction(
        AUTH_STORAGE_KEYS.STATE,
        JSON.stringify({ usuario: { id_usuario: '0' } }),
        NOW
      ),
      {
        type: 'reset',
        removeInvalidState: true,
      }
    );
  }),
  test('procesa el evento de logout aunque el estado ya haya sido eliminado', () => {
    assert.deepEqual(
      resolveAuthStorageSyncAction(
        AUTH_STORAGE_KEYS.LOGOUT_EVENT,
        JSON.stringify({ reason: 'manual', at: NOW }),
        NOW
      ),
      {
        type: 'reset',
        removeInvalidState: false,
      }
    );
  }),
  test('ignora cambios de almacenamiento ajenos a autenticación', () => {
    assert.deepEqual(
      resolveAuthStorageSyncAction('otra_clave', '{}', NOW),
      { type: 'ignore' }
    );
  }),
]);
