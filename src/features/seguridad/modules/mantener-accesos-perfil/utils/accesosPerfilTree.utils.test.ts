import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  buildAccesosPerfilTree,
  getAutomaticAncestorOptionIds,
  getConfigurableBranchOptionIds,
} from './accesosPerfilTree.utils';

const createOption = (
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

export const suite = defineSuite(
  'accesosPerfilTree.utils',
  [
    test(
      'reemplaza Root, numera la jerarquía y configura permisos solo en hojas',
      () => {
        const result =
          buildAccesosPerfilTree([
            createOption({
              idModulo: 4,
              nombre: 'Perfiles',
              tipo: 3,
              idPadre: 2,
              orden: 2,
            }),
            createOption({
              idModulo: 2,
              nombre: 'Seguridad',
              tipo: 2,
              idPadre: 1,
              orden: 1,
            }),
            createOption({
              idModulo: 3,
              nombre: 'Gestión',
              tipo: 2,
              idPadre: 1,
              orden: 2,
            }),
            createOption({
              idModulo: 1,
            }),
            createOption({
              idModulo: 5,
              nombre: 'Opciones',
              tipo: 3,
              idPadre: 2,
              orden: 1,
            }),
          ]);

        assert.deepEqual(
          result.map((item) =>
            item.displayLabel
          ),
          [
            'Todas las opciones',
            '1. Seguridad',
            '1.1. Opciones',
            '1.2. Perfiles',
            '2. Gestión',
          ]
        );

        assert.equal(
          result[0]?.isAssignmentTarget,
          false
        );
        assert.equal(
          result[1]?.isPermissionTarget,
          false
        );
        assert.equal(
          result[2]?.isPermissionTarget,
          true
        );
        assert.deepEqual(
          getConfigurableBranchOptionIds(
            result,
            2
          ),
          [5, 4]
        );
        assert.deepEqual(
          getAutomaticAncestorOptionIds(
            result,
            [5]
          ),
          [2]
        );
      }
    ),
    test(
      'muestra únicamente opciones activas y recalcula la rama visible',
      () => {
        const result =
          buildAccesosPerfilTree([
            createOption({
              idModulo: 1,
            }),
            createOption({
              idModulo: 2,
              nombre: 'Seguridad',
              tipo: 2,
              idPadre: 1,
            }),
            createOption({
              idModulo: 6,
              nombre: 'Mantener perfil',
              tipo: 3,
              idPadre: 2,
              estadoActivo: false,
              estado: 'Inactivo',
            }),
            createOption({
              idModulo: 7,
              nombre: 'Mantener módulo',
              tipo: 3,
              idPadre: 2,
              orden: 2,
            }),
          ]);

        assert.deepEqual(
          result.map((item) =>
            item.idModulo
          ),
          [1, 2, 7]
        );
        assert.deepEqual(
          getConfigurableBranchOptionIds(
            result,
            2
          ),
          [7]
        );
      }
    ),
    test(
      'mantiene como contenedor una opción activa cuyos hijos están inactivos',
      () => {
        const result =
          buildAccesosPerfilTree([
            createOption({
              idModulo: 1,
            }),
            createOption({
              idModulo: 2,
              nombre: 'Seguridad',
              tipo: 2,
              idPadre: 1,
            }),
            createOption({
              idModulo: 6,
              nombre: 'Mantener perfil',
              tipo: 3,
              idPadre: 2,
              estadoActivo: false,
              estado: 'Inactivo',
            }),
          ]);

        assert.deepEqual(
          result.map((item) => item.idModulo),
          [1, 2]
        );
        assert.equal(
          result[1]?.hasChildren,
          true
        );
        assert.equal(
          result[1]?.isPermissionTarget,
          false
        );
        assert.deepEqual(
          getConfigurableBranchOptionIds(
            result,
            2
          ),
          []
        );
      }
    ),
    test(
      'mantiene opciones huérfanas activas como raíces adicionales',
      () => {
        const result =
          buildAccesosPerfilTree([
            createOption({
              idModulo: 1,
            }),
            createOption({
              idModulo: 8,
              nombre: 'Huérfana',
              tipo: 2,
              idPadre: 99,
            }),
          ]);

        assert.deepEqual(
          result.map((item) =>
            item.displayLabel
          ),
          [
            'Todas las opciones',
            '2. Huérfana',
          ]
        );
      }
    ),
    test(
      'rechaza identificadores duplicados y ciclos en la jerarquía activa',
      () => {
        assert.throws(
          () =>
            buildAccesosPerfilTree([
              createOption({
                idModulo: 1,
              }),
              createOption({
                idModulo: 1,
              }),
            ]),
          /duplicada/
        );

        assert.throws(
          () =>
            buildAccesosPerfilTree([
              createOption({
                idModulo: 1,
                idPadre: 2,
              }),
              createOption({
                idModulo: 2,
                tipo: 2,
                idPadre: 1,
              }),
            ]),
          /ciclo/
        );
      }
    ),
  ]
);
