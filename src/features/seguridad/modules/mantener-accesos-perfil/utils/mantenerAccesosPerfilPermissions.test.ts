import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  assertMantenerAccesosPerfilPermission,
  getMantenerAccesosPerfilPermissionMessage,
} from './mantenerAccesosPerfilPermissions';

export const suite = defineSuite(
  'mantenerAccesosPerfilPermissions',
  [
    test(
      'permite asignar y editar accesos cuando la operación está autorizada',
      () => {
        assert.doesNotThrow(() => {
          assertMantenerAccesosPerfilPermission(
            'insertar',
            true
          );

          assertMantenerAccesosPerfilPermission(
            'editar',
            true
          );
        });
      }
    ),
    test(
      'bloquea las operaciones de accesos sin el permiso correspondiente',
      () => {
        assert.throws(
          () =>
            assertMantenerAccesosPerfilPermission(
              'insertar',
              false
            ),
          /permiso para asignar accesos/i
        );

        assert.throws(
          () =>
            assertMantenerAccesosPerfilPermission(
              'editar',
              false
            ),
          /permiso para editar los accesos/i
        );

        assert.equal(
          getMantenerAccesosPerfilPermissionMessage(
            'editar'
          ),
          'No tiene permiso para editar los accesos de los perfiles.'
        );
      }
    ),
  ]
);
