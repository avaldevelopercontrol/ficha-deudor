import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  Modulo,
} from '../types/opcion.types';

import {
  buildCreateOpcionRequest,
} from './crearOpcion.mapper';

const root: Modulo = {
  idModulo: 1,
  nombre: 'Root',
  descripcion: '',
  codigo: 'Root',
  ruta: 'root/',
  icono: '',
  tipo: 1,
  idPadre: 0,
  codigoPadre: '',
  padre: '',
  orden: 0,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
};

export const suite = defineSuite(
  'crearOpcion.mapper',
  [
    test(
      'envía visible en false cuando el nuevo módulo se registra inactivo',
      () => {
        const request =
          buildCreateOpcionRequest(
            {
              nombre: 'Mantener Grupo',
              descripcion:
                'Descripción de prueba',
              codigo: 'mMantenerGrupo',
              icono: '',
              padreId: 1,
              visible: true,
              estado: false,
            },
            [root],
            '16068',
            new Date(
              '2026-08-05T16:12:59.850Z'
            )
          );

        assert.equal(
          request.bEstado,
          false
        );
        assert.equal(
          request.bVisible,
          false
        );
        assert.equal(
          request.sDescripcionOpcion,
          'Descripción de prueba'
        );
        assert.equal(
          request.sUrlOpcion,
          'root/mMantenerGrupo/'
        );
        assert.equal(
          request.sUrlBI,
          ''
        );
        assert.equal(
          request.dFechaCrea,
          '2026-08-05T11:12:59.850'
        );
      }
    ),
    test(
      'permite registrar un módulo sin pantalla React y construye la ruta desde el padre',
      () => {
        const parent: Modulo = {
          ...root,
          idModulo: 30,
          nombre: 'Administración',
          codigo: 'mAdministracion',
          ruta: 'root/mAdministracion/',
          tipo: 2,
          idPadre: 1,
          orden: 1,
        };

        const request =
          buildCreateOpcionRequest(
            {
              nombre: 'Operaciones',
              descripcion:
                'Contenedor pendiente de implementación.',
              codigo: 'mOperaciones',
              icono: '',
              padreId: 30,
              visible: true,
              estado: true,
            },
            [root, parent],
            '16068',
            new Date(
              '2026-08-05T16:12:59.850Z'
            )
          );

        assert.equal(
          request.sCodigoOpcion,
          'mOperaciones'
        );
        assert.equal(
          request.sUrlOpcion,
          'root/mAdministracion/mOperaciones/'
        );
        assert.equal(
          request.sUrlBI,
          ''
        );
        assert.equal(
          request.nId_OpcionPadre,
          30
        );
        assert.equal(
          request.nTipo,
          3
        );
      }
    ),
  ]
);
