import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  OpcionTreeItem,
} from '../types/asignarAccesosPerfil.types';

import {
  ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
  createAsignarAccesosPerfilFormFromAssignments,
  getPerfilOpcionBranchAllPermissionsState,
  getPerfilOpcionBranchPermissionStates,
  getPerfilOpcionBranchSelectionState,
  normalizeAsignarAccesosPerfilForm,
  setAllPerfilOpcionBranchPermissions,
  setPerfilOpcionBranchPermission,
  setPerfilOpcionBranchSelected,
  validateAsignarAccesosPerfilForm,
  validateEditarAccesosPerfilForm,
} from './asignarAccesosPerfil.utils';

const createTreeItem = (
  overrides: Partial<OpcionTreeItem>
): OpcionTreeItem => ({
  idModulo: 1,
  nombre: 'Todas las opciones',
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
  depth: 0,
  treeCode: '1',
  displayLabel: 'Todas las opciones',
  hasChildren: true,
  isAssignmentTarget: false,
  isPermissionTarget: false,
  ...overrides,
});

const treeItems: OpcionTreeItem[] = [
  createTreeItem({}),
  createTreeItem({
    idModulo: 2,
    nombre: 'Seguridad',
    codigo: 'mSeguridad',
    tipo: 2,
    idPadre: 1,
    depth: 1,
    treeCode: '1',
    displayLabel: '1. Seguridad',
    isAssignmentTarget: true,
  }),
  createTreeItem({
    idModulo: 6,
    nombre: 'Mantener perfil',
    codigo: 'mMantenerPerfil',
    tipo: 3,
    idPadre: 2,
    depth: 2,
    treeCode: '1.1',
    displayLabel: '1.1. Mantener perfil',
    hasChildren: false,
    isAssignmentTarget: true,
    isPermissionTarget: true,
  }),
  createTreeItem({
    idModulo: 7,
    nombre: 'Mantener módulo',
    codigo: 'mMantenerModulo',
    tipo: 3,
    idPadre: 2,
    depth: 2,
    treeCode: '1.2',
    displayLabel: '1.2. Mantener módulo',
    hasChildren: false,
    isAssignmentTarget: true,
    isPermissionTarget: true,
  }),
  createTreeItem({
    idModulo: 4,
    nombre: 'Gestión de cobranzas',
    codigo: 'mGestion',
    tipo: 2,
    idPadre: 1,
    depth: 1,
    treeCode: '2',
    displayLabel: '2. Gestión de cobranzas',
    hasChildren: false,
    isAssignmentTarget: true,
    isPermissionTarget: true,
  }),
];

export const suite = defineSuite(
  'asignarAccesosPerfil.utils',
  [
    test(
      'seleccionar un contenedor marca sus hojas y agrega el padre automáticamente',
      () => {
        const selected =
          setPerfilOpcionBranchSelected(
            ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
            treeItems,
            2,
            true
          );

        assert.deepEqual(
          selected.selectedOptionIds,
          [2, 6, 7]
        );
        assert.deepEqual(
          Object.keys(
            selected.permissionsByOptionId
          ),
          ['6', '7']
        );
        assert.equal(
          getPerfilOpcionBranchSelectionState(
            selected,
            treeItems,
            2
          ),
          'checked'
        );

        const cleared =
          setPerfilOpcionBranchSelected(
            selected,
            treeItems,
            2,
            false
          );

        assert.deepEqual(
          cleared.selectedOptionIds,
          []
        );
      }
    ),
    test(
      'seleccionar una hoja agrega ancestros y deja el contenedor en estado parcial',
      () => {
        const selected =
          setPerfilOpcionBranchSelected(
            ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
            treeItems,
            6,
            true
          );

        assert.deepEqual(
          selected.selectedOptionIds,
          [2, 6]
        );
        assert.equal(
          getPerfilOpcionBranchSelectionState(
            selected,
            treeItems,
            2
          ),
          'mixed'
        );

        assert.deepEqual(
          getPerfilOpcionBranchPermissionStates(
            selected,
            treeItems,
            2
          ),
          {
            consultar: 'checked',
            insertar: 'unchecked',
            editar: 'unchecked',
            eliminar: 'unchecked',
            exportar: 'unchecked',
          }
        );
      }
    ),
    test(
      'los permisos de contenedores no son editables y cada hoja conserva los propios',
      () => {
        const selected =
          setPerfilOpcionBranchSelected(
            ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
            treeItems,
            2,
            true
          );
        const parentAttempt =
          setPerfilOpcionBranchPermission(
            selected,
            treeItems,
            2,
            'editar',
            true
          );

        assert.equal(
          parentAttempt.permissionsByOptionId['2'],
          undefined
        );

        const leafChanged =
          setPerfilOpcionBranchPermission(
            parentAttempt,
            treeItems,
            6,
            'editar',
            true
          );

        assert.equal(
          leafChanged.permissionsByOptionId['6']
            ?.editar,
          true
        );
        assert.equal(
          leafChanged.permissionsByOptionId['7']
            ?.editar,
          false
        );
      }
    ),
    test(
      'seleccionar todos los permisos solo modifica una opción final',
      () => {
        const parentAttempt =
          setAllPerfilOpcionBranchPermissions(
            ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
            treeItems,
            2,
            true
          );

        assert.deepEqual(
          parentAttempt.selectedOptionIds,
          []
        );

        const result =
          setAllPerfilOpcionBranchPermissions(
            parentAttempt,
            treeItems,
            6,
            true
          );
        const states =
          getPerfilOpcionBranchPermissionStates(
            result,
            treeItems,
            6
          );

        assert.deepEqual(
          result.selectedOptionIds,
          [2, 6]
        );
        assert.equal(
          getPerfilOpcionBranchAllPermissionsState(
            states
          ),
          'checked'
        );
      }
    ),
    test(
      'exige permisos solamente en opciones finales seleccionadas',
      () => {
        const emptyErrors =
          validateAsignarAccesosPerfilForm(
            ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
            treeItems
          );

        assert.ok(emptyErrors.perfilId);
        assert.match(
          emptyErrors.selectedOptionIds ?? '',
          /opción final/
        );

        const selected = {
          ...setPerfilOpcionBranchSelected(
            ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
            treeItems,
            2,
            true
          ),
          perfilId: 9,
        };

        const permissionErrors =
          validateAsignarAccesosPerfilForm(
            selected,
            treeItems
          );

        assert.match(
          permissionErrors.permissionsByOptionId ?? '',
          /2 opciones finales/
        );

        const firstValid =
          setPerfilOpcionBranchPermission(
            selected,
            treeItems,
            6,
            'consultar',
            true
          );
        const valid =
          setPerfilOpcionBranchPermission(
            firstValid,
            treeItems,
            7,
            'editar',
            true
          );

        assert.deepEqual(
          validateAsignarAccesosPerfilForm(
            valid,
            treeItems
          ),
          {}
        );
      }
    ),
    test(
      'normaliza padres con solo consultar y hojas con permisos configurados',
      () => {
        const form =
          setPerfilOpcionBranchPermission(
            {
              ...ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
              perfilId: 9,
            },
            treeItems,
            6,
            'editar',
            true
          );

        assert.deepEqual(
          normalizeAsignarAccesosPerfilForm(
            form,
            treeItems
          ),
          {
            perfilId: 9,
            assignments: [
              {
                opcionId: 2,
                permissions: {
                  consultar: true,
                  insertar: false,
                  editar: false,
                  eliminar: false,
                  exportar: false,
                },
              },
              {
                opcionId: 6,
                permissions: {
                  consultar: false,
                  insertar: false,
                  editar: true,
                  eliminar: false,
                  exportar: false,
                },
              },
            ],
          }
        );
      }
    ),
    test(
      'precarga las hojas activas y conserva sus permisos al editar',
      () => {
        const form =
          createAsignarAccesosPerfilFormFromAssignments(
            9,
            [
              {
                idPerfilOpcion: 1,
                idPerfil: 9,
                idOpcion: 1,
                consultar: false,
                insertar: false,
                editar: false,
                eliminar: false,
                exportar: false,
                estadoActivo: true,
              },
              {
                idPerfilOpcion: 2,
                idPerfil: 9,
                idOpcion: 2,
                consultar: true,
                insertar: false,
                editar: false,
                eliminar: false,
                exportar: false,
                estadoActivo: true,
              },
              {
                idPerfilOpcion: 3,
                idPerfil: 9,
                idOpcion: 6,
                consultar: true,
                insertar: false,
                editar: true,
                eliminar: false,
                exportar: true,
                estadoActivo: true,
              },
              {
                idPerfilOpcion: 4,
                idPerfil: 9,
                idOpcion: 7,
                consultar: true,
                insertar: true,
                editar: true,
                eliminar: true,
                exportar: true,
                estadoActivo: false,
              },
            ],
            treeItems
          );

        assert.deepEqual(
          form.selectedOptionIds,
          [2, 6]
        );
        assert.equal(
          form.activeOptionId,
          6
        );
        assert.deepEqual(
          form.permissionsByOptionId['6'],
          {
            consultar: true,
            insertar: false,
            editar: true,
            eliminar: false,
            exportar: true,
          }
        );
        assert.equal(
          form.selectedOptionIds.includes(1),
          false
        );
      }
    ),
    test(
      'la edición permite desmarcar todas las opciones',
      () => {
        const emptyEditForm = {
          ...ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
          perfilId: 9,
        };

        assert.deepEqual(
          validateEditarAccesosPerfilForm(
            emptyEditForm,
            treeItems
          ),
          {}
        );
        assert.match(
          validateAsignarAccesosPerfilForm(
            emptyEditForm,
            treeItems
          ).selectedOptionIds ?? '',
          /por lo menos una opción/
        );
      }
    ),
    test(
      'Todas las opciones selecciona hojas activas y excluye Root del registro',
      () => {
        const result =
          setPerfilOpcionBranchSelected(
            ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
            treeItems,
            1,
            true
          );

        assert.deepEqual(
          result.selectedOptionIds,
          [2, 6, 7, 4]
        );
        assert.equal(
          result.selectedOptionIds.includes(1),
          false
        );
      }
    ),
  ]
);
