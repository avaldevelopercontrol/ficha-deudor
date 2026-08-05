import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  Modulo,
  OpcionApi,
} from '../types/opcion.types';

import {
  buildUpdateOpcionRequests,
} from './actualizarOpcion.mapper';

const createModule = (
  overrides: Partial<Modulo>
): Modulo => ({
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
  ...overrides,
});

const detail: OpcionApi = {
  nId_Opcion: 2,
  sCodigoOpcion: 'mSeguridad',
  sNombreOpcion: 'Seguridad',
  sDescripcionOpcion:
    'Módulo de seguridad',
  sUrlOpcion: 'root/mSeguridad/',
  sIcono: '/candado.ico',
  nTipo: 2,
  nId_OpcionPadre: 1,
  sCodigoOpcionPadre: 'Root',
  sNombreOpcionPadre: 'Root',
  nOrden: 1,
  bVisible: true,
  bEstado: true,
  nCrea: 14931,
  dFechaCrea: '2026-08-03 17:27:12',
  nModifica: 16068,
  dFechaModifica: '2026-08-04 00:00:00',
};

const root = createModule({
  idModulo: 1,
});

const parent = createModule({
  idModulo: 2,
  nombre: 'Seguridad',
  codigo: 'mSeguridad',
  ruta: 'root/mSeguridad/',
  icono: '/candado.ico',
  tipo: 2,
  idPadre: 1,
  codigoPadre: 'Root',
  padre: 'Root',
  orden: 1,
});

const child = createModule({
  idModulo: 6,
  nombre: 'Mantener perfil',
  codigo: 'mMantenerPerfil',
  ruta: 'root/mSeguridad/mMantenerPerfil/',
  tipo: 3,
  idPadre: 2,
  codigoPadre: 'mSeguridad',
  padre: 'Seguridad',
  orden: 1,
});

const inactiveChild: Modulo = {
  ...child,
  visibleActivo: false,
  visible: 'No',
  estadoActivo: false,
  estado: 'Inactivo',
};

const inactiveForm = {
  nombre: 'Seguridad',
  descripcion:
    'Módulo de seguridad actualizado',
  codigo: 'mSeguridad',
  icono: '/candado.ico',
  padreId: 1,
  orden: 1,
  visible: true,
  estado: false,
};

export const suite = defineSuite(
  'actualizarOpcion.mapper',
  [
    test(
      'rechaza inactivar un padre mientras conserve descendientes activos',
      () => {
        assert.throws(
          () =>
            buildUpdateOpcionRequests(
              detail,
              inactiveForm,
              [
                root,
                parent,
                child,
              ],
              '16068'
            ),
          /primero inactive/i
        );
      }
    ),
    test(
      'permite inactivar el padre después de sus hijos y fuerza visible en false',
      () => {
        const requests =
          buildUpdateOpcionRequests(
            detail,
            inactiveForm,
            [
              root,
              parent,
              inactiveChild,
            ],
            '16068',
            new Date(
              '2026-08-05T16:18:55.053Z'
            )
          );

        const parentRequest =
          requests.find(
            (request) =>
              request.nId_Opcion === 2
          );

        assert.ok(parentRequest);
        assert.equal(
          parentRequest.bEstado,
          false
        );
        assert.equal(
          parentRequest.bVisible,
          false
        );
        assert.equal(
          parentRequest.sDescripcionOpcion,
          'Módulo de seguridad actualizado'
        );
        assert.equal(
          parentRequest.dFechaModifica,
          '2026-08-05T11:18:55.053'
        );
      }
    ),
  ]
);
