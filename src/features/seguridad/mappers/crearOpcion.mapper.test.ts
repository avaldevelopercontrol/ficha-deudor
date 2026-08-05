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
              nombre: 'Módulo inactivo',
              descripcion:
                'Descripción de prueba',
              codigo: 'mModuloInactivo',
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
          request.dFechaCrea,
          '2026-08-05T11:12:59.850'
        );
      }
    ),
  ]
);
