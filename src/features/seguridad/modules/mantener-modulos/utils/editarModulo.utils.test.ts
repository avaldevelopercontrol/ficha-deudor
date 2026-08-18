import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  OpcionApi,
} from '../../../types/opcion.types';

import {
  resolveModuloCodeAfterNameChange,
} from './editarModulo.utils';

const createOpcion = (
  overrides: Partial<OpcionApi> = {}
): OpcionApi => ({
  nId_Opcion: 30,
  sCodigoOpcion: 'mModuloPendiente',
  sNombreOpcion: 'Módulo pendiente',
  sDescripcionOpcion: '',
  sUrlOpcion:
    'root/mModuloPendiente/',
  sUrlBI: '',
  sIcono: '',
  nTipo: 2,
  nId_OpcionPadre: 1,
  sCodigoOpcionPadre: 'Root',
  sNombreOpcionPadre: 'Root',
  nOrden: 1,
  bVisible: true,
  bEstado: true,
  nCrea: 16068,
  dFechaCrea:
    '2026-08-18 16:00:00',
  nModifica: 0,
  dFechaModifica: null,
  ...overrides,
});

export const suite = defineSuite(
  'editarModulo.utils',
  [
    test(
      'actualiza el código sugerido cuando se renombra cualquier módulo no raíz',
      () => {
        const code =
          resolveModuloCodeAfterNameChange(
            createOpcion({
              nId_Opcion: 20,
              sCodigoOpcion:
                'mMantenerUsuario',
              sNombreOpcion:
                'Mantener usuario',
            }),
            'Administrar usuarios'
          );

        assert.equal(
          code,
          'mAdministrarUsuarios'
        );
      }
    ),
    test(
      'preserva el código Root aunque cambie su nombre visible',
      () => {
        const code =
          resolveModuloCodeAfterNameChange(
            createOpcion({
              nId_Opcion: 1,
              sCodigoOpcion: 'Root',
              sNombreOpcion: 'Root',
              sUrlOpcion: 'root/',
              nTipo: 1,
              nId_OpcionPadre: 0,
              nOrden: 0,
            }),
            'Raíz del sistema'
          );

        assert.equal(
          code,
          'Root'
        );
      }
    ),
  ]
);
