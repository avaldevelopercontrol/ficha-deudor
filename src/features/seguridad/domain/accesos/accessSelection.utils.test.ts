import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import type {
  AccessTreeItem,
} from './access.types';
import {
  buildAccessBranchSelectionSummaryIndex,
  getAccessBranchSelectionState,
} from './accessSelection.utils';

const createItem = (
  overrides: Partial<AccessTreeItem>
): AccessTreeItem => ({
  idModulo: 1,
  nombre: 'Root',
  descripcion: '',
  codigo: 'Root',
  ruta: 'root/',
  urlBI: null,
  imagenOpcion: null,
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
  depth: 0,
  treeCode: '1',
  displayLabel: 'Todas las opciones',
  hasChildren: true,
  isAssignmentTarget: false,
  isPermissionTarget: false,
  ...overrides,
});

const treeItems: AccessTreeItem[] = [
  createItem({}),
  createItem({
    idModulo: 2,
    idPadre: 1,
    depth: 1,
    nombre: 'Seguridad',
    displayLabel: '1. Seguridad',
    isAssignmentTarget: true,
  }),
  createItem({
    idModulo: 10,
    idPadre: 2,
    depth: 2,
    nombre: 'Perfil',
    displayLabel: '1.1. Perfil',
    hasChildren: false,
    isAssignmentTarget: true,
    isPermissionTarget: true,
  }),
  createItem({
    idModulo: 11,
    idPadre: 2,
    depth: 2,
    nombre: 'Módulo',
    displayLabel: '1.2. Módulo',
    hasChildren: false,
    isAssignmentTarget: true,
    isPermissionTarget: true,
  }),
  createItem({
    idModulo: 3,
    idPadre: 1,
    depth: 1,
    nombre: 'Contenedor vacío',
    displayLabel: '2. Contenedor vacío',
    isAssignmentTarget: true,
  }),
];

export const suite = defineSuite(
  'accessSelection.utils',
  [
    test(
      'calcula checked, mixed y disabled para todo el árbol en un solo índice',
      () => {
        const summaries =
          buildAccessBranchSelectionSummaryIndex(
            [2, 10],
            treeItems
          );

        assert.deepEqual(
          summaries.get(10),
          {
            state: 'checked',
            configurableOptionCount: 1,
            selectedOptionCount: 1,
          }
        );
        assert.equal(
          summaries.get(11)?.state,
          'unchecked'
        );
        assert.deepEqual(
          summaries.get(2),
          {
            state: 'mixed',
            configurableOptionCount: 2,
            selectedOptionCount: 1,
          }
        );
        assert.equal(
          summaries.get(1)?.state,
          'mixed'
        );
        assert.deepEqual(
          summaries.get(3),
          {
            state: 'unchecked',
            configurableOptionCount: 0,
            selectedOptionCount: 0,
          }
        );
      }
    ),
    test(
      'mantiene el mismo contrato del cálculo puntual de selección',
      () => {
        const form = {
          selectedOptionIds: [
            2,
            10,
            11,
          ],
          activeOptionId: 2,
          permissionsByOptionId: {},
        };

        assert.equal(
          getAccessBranchSelectionState(
            form,
            treeItems,
            2
          ),
          'checked'
        );
        assert.equal(
          getAccessBranchSelectionState(
            form,
            treeItems,
            3
          ),
          'unchecked'
        );
      }
    ),
  ]
);
