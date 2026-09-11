import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  assertMantenerAccesosUsuarioPermission,
  getMantenerAccesosUsuarioPermissionMessage,
} from './mantenerAccesosUsuarioPermissions';

export const suite = defineSuite(
  'mantenerAccesosUsuarioPermissions',
  [
    test(
      'permite asignar y editar accesos cuando la operación está autorizada',
      () => {
        assert.doesNotThrow(() =>
          assertMantenerAccesosUsuarioPermission(
            'insertar',
            true
          )
        );
        assert.doesNotThrow(() =>
          assertMantenerAccesosUsuarioPermission(
            'editar',
            true
          )
        );
      }
    ),
    test(
      'bloquea operaciones con el mensaje específico del permiso',
      () => {
        assert.throws(
          () =>
            assertMantenerAccesosUsuarioPermission(
              'insertar',
              false
            ),
          new RegExp(
            getMantenerAccesosUsuarioPermissionMessage(
              'insertar'
            )
          )
        );
        assert.throws(
          () =>
            assertMantenerAccesosUsuarioPermission(
              'editar',
              false
            ),
          new RegExp(
            getMantenerAccesosUsuarioPermissionMessage(
              'editar'
            )
          )
        );
      }
    ),
  ]
);
