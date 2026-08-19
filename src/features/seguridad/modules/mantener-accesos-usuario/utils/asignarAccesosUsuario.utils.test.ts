import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  OpcionTreeItem,
} from '../../mantener-accesos-perfil/types/asignarAccesosPerfil.types';

import {
  createAsignarAccesosUsuarioFormFromAssignments,
  normalizeAsignarAccesosUsuarioForm,
} from './asignarAccesosUsuario.utils';

const treeItems: OpcionTreeItem[] = [
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
