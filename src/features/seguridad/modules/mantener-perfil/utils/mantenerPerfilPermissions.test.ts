import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  assertMantenerPerfilPermission,
  getMantenerPerfilPermissionMessage,
} from './mantenerPerfilPermissions';

export const suite = defineSuite(
  'mantenerPerfilPermissions',
  [
    test(
      'permite continuar cuando la operación está autorizada',
      () => {
        assert.doesNotThrow(() => {
          assertMantenerPerfilPermission(
            'insertar',
            true
          );

          assertMantenerPerfilPermission(
            'editar',
            true
          );
        });
      }
    ),
    test(
      'bloquea las operaciones sin permiso con un mensaje específico',
      () => {
        assert.throws(
          () =>
            assertMantenerPerfilPermission(
              'insertar',
              false
            ),
          /permiso para agregar perfiles/i
        );

        assert.throws(
          () =>
            assertMantenerPerfilPermission(
              'editar',
              false
            ),
          /permiso para editar perfiles/i
        );

        assert.equal(
          getMantenerPerfilPermissionMessage(
            'editar'
          ),
          'No tiene permiso para editar perfiles.'
        );
      }
    ),
  ]
);
