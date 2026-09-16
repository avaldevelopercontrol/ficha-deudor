import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control';

import type {
  AccessTreeItem,
} from '../../../domain/accesos/access.types';

import {
  createAsignarAccesosUsuarioFormFromAssignments,
  normalizeAsignarAccesosUsuarioForm,
} from './asignarAccesosUsuario.utils';

const treeItems: AccessTreeItem[] = [
  {
    idModulo: 2,
    nombre: 'Seguridad',
    descripcion: '',
    codigo: 'mSeguridad',
    ruta: 'root/mSeguridad/',
    urlBI: null,
    imagenOpcion: null,
    icono: '',
    tipo: 2,
    idPadre: 0,
    codigoPadre: '',
    padre: '',
    orden: 1,
    visibleActivo: true,
    visible: 'Sí',
    estadoActivo: true,
    estado: 'Activo',
    depth: 0,
    treeCode: '1',
    displayLabel: '1. Seguridad',
    hasChildren: true,
    isAssignmentTarget: true,
    isPermissionTarget: false,
  },
  {
    idModulo: 10,
    nombre: 'Mantener perfil',
    descripcion: '',
    codigo: 'mMantenerPerfil',
    ruta: 'root/mSeguridad/mMantenerPerfil/',
    urlBI: null,
    imagenOpcion: null,
    icono: '',
    tipo: 3,
    idPadre: 2,
    codigoPadre: 'mSeguridad',
    padre: 'Seguridad',
    orden: 1,
    visibleActivo: true,
    visible: 'Sí',
    estadoActivo: true,
    estado: 'Activo',
    depth: 1,
    treeCode: '1.1',
    displayLabel: '1.1. Mantener perfil',
    hasChildren: false,
    isAssignmentTarget: true,
    isPermissionTarget: true,
  },
  {
    idModulo: 999,
    nombre: 'Power BI futuro',
    descripcion: '',
    codigo: 'mPowerBiFuturo',
    ruta: 'root/mSeguridad/mPowerBiFuturo/',
    urlBI: 'https://app.powerbi.com/view?r=demo',
    imagenOpcion: null,
    icono: '',
    tipo: 3,
    idPadre: 2,
    codigoPadre: 'mSeguridad',
    padre: 'Seguridad',
    orden: 2,
    visibleActivo: true,
    visible: 'Sí',
    estadoActivo: true,
    estado: 'Activo',
    depth: 1,
    treeCode: '1.2',
    displayLabel: '1.2. Power BI futuro',
    hasChildren: false,
    isAssignmentTarget: true,
    isPermissionTarget: true,
  },
];

export const suite = defineSuite(
  'asignarAccesosUsuario.utils',
  [
    test(
      'limpia eliminar y exportar de Mantener perfil al cargar accesos existentes',
      () => {
        const form =
          createAsignarAccesosUsuarioFormFromAssignments(
            10,
            20,
            [
              {
                idUsuarioGrupoOpcion: 1,
                idUsuario: 10,
                idGrupo: 20,
                idOpcion: 10,
                consultar: true,
                insertar: true,
                editar: true,
                eliminar: true,
                exportar: true,
                estadoActivo: true,
                crea: 1,
                fechaCrea: '2026-08-12T10:00:00',
              },
            ],
            treeItems
          );

        assert.deepEqual(
          form.permissionsByOptionId['10'],
          {
            consultar: true,
            insertar: true,
            editar: true,
            eliminar: false,
            exportar: false,
          }
        );
      }
    ),
    test(
      'limpia permisos de escritura de un Power BI al cargar accesos existentes',
      () => {
        const form =
          createAsignarAccesosUsuarioFormFromAssignments(
            10,
            20,
            [
              {
                idUsuarioGrupoOpcion: 2,
                idUsuario: 10,
                idGrupo: 20,
                idOpcion: 999,
                consultar: true,
                insertar: true,
                editar: true,
                eliminar: true,
                exportar: true,
                estadoActivo: true,
                crea: 1,
                fechaCrea: '2026-08-12T10:00:00',
              },
            ],
            treeItems
          );

        assert.deepEqual(
          form.permissionsByOptionId['999'],
          {
            consultar: true,
            insertar: false,
            editar: false,
            eliminar: false,
            exportar: false,
          }
        );
      }
    ),
    test(
      'normaliza un Power BI con solo consultar antes de guardar',
      () => {
        const normalized =
          normalizeAsignarAccesosUsuarioForm(
            {
              usuarioId: 10,
              grupoId: 20,
              selectedOptionIds: [2, 999],
              activeOptionId: 999,
              permissionsByOptionId: {
                '999': {
                  consultar: true,
                  insertar: true,
                  editar: true,
                  eliminar: true,
                  exportar: true,
                },
              },
            },
            treeItems
          );

        assert.deepEqual(
          normalized.assignments.find(
            (assignment) =>
              assignment.opcionId === 999
          )?.permissions,
          {
            consultar: true,
            insertar: false,
            editar: false,
            eliminar: false,
            exportar: false,
          }
        );
      }
    ),
    test(
      'Sesiones BI persiste únicamente consultar en accesos por usuario',
      () => {
        const sesionesBiTreeItems = [
          ...treeItems,
          {
            ...treeItems[2],
            idModulo:
              APPLICATION_OPTION_IDS
                .SESIONES_BI,
            nombre: 'Sesiones BI',
            codigo: 'mSesionesBi',
            urlBI: null,
            orden: 3,
            treeCode: '1.3',
            displayLabel:
              '1.3. Sesiones BI',
          } satisfies AccessTreeItem,
        ];

        const normalized =
          normalizeAsignarAccesosUsuarioForm(
            {
              usuarioId: 10,
              grupoId: 20,
              selectedOptionIds: [
                2,
                APPLICATION_OPTION_IDS
                  .SESIONES_BI,
              ],
              activeOptionId:
                APPLICATION_OPTION_IDS
                  .SESIONES_BI,
              permissionsByOptionId: {
                [String(
                  APPLICATION_OPTION_IDS
                    .SESIONES_BI
                )]: {
                  consultar: true,
                  insertar: true,
                  editar: true,
                  eliminar: true,
                  exportar: true,
                },
              },
            },
            sesionesBiTreeItems
          );

        assert.deepEqual(
          normalized.assignments.find(
            (assignment) =>
              assignment.opcionId ===
              APPLICATION_OPTION_IDS
                .SESIONES_BI
          )?.permissions,
          {
            consultar: true,
            insertar: false,
            editar: false,
            eliminar: false,
            exportar: false,
          }
        );
      }
    ),
    test(
      'normaliza Mantener perfil sin permisos no soportados antes de guardar',
      () => {
        const normalized =
          normalizeAsignarAccesosUsuarioForm(
            {
              usuarioId: 10,
              grupoId: 20,
              selectedOptionIds: [2, 10],
              activeOptionId: 10,
              permissionsByOptionId: {
                '10': {
                  consultar: true,
                  insertar: true,
                  editar: true,
                  eliminar: true,
                  exportar: true,
                },
              },
            },
            treeItems
          );

        assert.deepEqual(
          normalized.assignments.find(
            (assignment) =>
              assignment.opcionId === 10
          )?.permissions,
          {
            consultar: true,
            insertar: true,
            editar: true,
            eliminar: false,
            exportar: false,
          }
        );
      }
    ),
  ]
);
