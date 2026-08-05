import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  assertMantenerModulosPermission,
  getMantenerModulosPermissionMessage,
} from './mantenerModulosPermissions';

export const suite = defineSuite(
  'mantenerModulosPermissions',
  [
    test(
      'permite registrar y editar cuando la operación está autorizada',
      () => {
        assert.doesNotThrow(() => {
          assertMantenerModulosPermission(
            'insertar',
            true
          );

          assertMantenerModulosPermission(
            'editar',
            true
          );
        });
      }
    ),
    test(
      'bloquea las operaciones de módulos sin el permiso correspondiente',
      () => {
        assert.throws(
          () =>
            assertMantenerModulosPermission(
              'insertar',
              false
            ),
          /permiso para agregar módulos/i
        );

        assert.throws(
          () =>
            assertMantenerModulosPermission(
              'editar',
              false
            ),
          /permiso para editar módulos/i
        );

        assert.equal(
          getMantenerModulosPermissionMessage(
            'editar'
          ),
          'No tiene permiso para editar módulos.'
        );
      }
    ),
  ]
);
