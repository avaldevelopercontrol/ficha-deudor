import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  assertMantenerBiPermission,
  getMantenerBiPermissionMessage,
} from './mantenerBiPermissions';

export const suite = defineSuite(
  'mantenerBiPermissions',
  [
    test(
      'permite registrar BI cuando la operación está autorizada',
      () => {
        assert.doesNotThrow(() => {
          assertMantenerBiPermission(
            'insertar',
            true
          );
        });
      }
    ),
    test(
      'bloquea el registro de BI sin permiso de inserción',
      () => {
        assert.throws(
          () =>
            assertMantenerBiPermission(
              'insertar',
              false
            ),
          /permiso para agregar BI/i
        );

        assert.equal(
          getMantenerBiPermissionMessage(
            'insertar'
          ),
          'No tiene permiso para agregar BI.'
        );
      }
    ),
    test(
      'protege la edición con el permiso propio de Mantener BI',
      () => {
        assert.doesNotThrow(() => {
          assertMantenerBiPermission(
            'editar',
            true
          );
        });

        assert.throws(
          () =>
            assertMantenerBiPermission(
              'editar',
              false
            ),
          /permiso para editar BI/i
        );

        assert.equal(
          getMantenerBiPermissionMessage(
            'editar'
          ),
          'No tiene permiso para editar BI.'
        );
      }
    ),
  ]
);
