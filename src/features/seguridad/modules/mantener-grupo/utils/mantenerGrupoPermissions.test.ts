import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  assertMantenerGrupoPermission,
  getMantenerGrupoPermissionMessage,
} from './mantenerGrupoPermissions';

export const suite = defineSuite(
  'mantenerGrupoPermissions',
  [
    test(
      'permite registrar y editar cuando la operación está autorizada',
      () => {
        assert.doesNotThrow(
          () =>
            assertMantenerGrupoPermission(
              'insertar',
              true
            )
        );

        assert.doesNotThrow(
          () =>
            assertMantenerGrupoPermission(
              'editar',
              true
            )
        );
      }
    ),
    test(
      'bloquea las operaciones sin el permiso correspondiente',
      () => {
        assert.throws(
          () =>
            assertMantenerGrupoPermission(
              'insertar',
              false
            ),
          new RegExp(
            getMantenerGrupoPermissionMessage(
              'insertar'
            )
          )
        );

        assert.throws(
          () =>
            assertMantenerGrupoPermission(
              'editar',
              false
            ),
          new RegExp(
            getMantenerGrupoPermissionMessage(
              'editar'
            )
          )
        );
      }
    ),
  ]
);
