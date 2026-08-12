import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  OpcionTreeItem,
} from '../types/asignarAccesosPerfil.types';

import {
  getPerfilOpcionPermissionAvailability,
  sanitizePerfilOpcionPermissions,
} from './opcionAccessCapabilities.utils';

const createOption = (
  codigo: string
): OpcionTreeItem => ({
  idModulo: 6,
  nombre: 'Opción',
  descripcion: '',
  codigo,
  ruta: 'root/opcion/',
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
  depth: 2,
  treeCode: '1.1',
  displayLabel: '1.1. Opción',
  hasChildren: false,
  isAssignmentTarget: true,
  isPermissionTarget: true,
});

export const suite = defineSuite(
  'opcionAccessCapabilities.utils',
  [
    test(
      'los mantenimientos revisados solo habilitan consultar, insertar y editar',
      () => {
        const optionCodes = [
          'mMantenerPerfil',
          'mMantenerModulo',
          'mMantenerGrupo',
          'mMantenerAccesosPorPerfil',
          'mMantenerAccesosPorUsuario',
        ];

        optionCodes.forEach((optionCode) => {
          assert.deepEqual(
            getPerfilOpcionPermissionAvailability(
              createOption(optionCode)
            ),
            {
              consultar: true,
              insertar: true,
              editar: true,
              eliminar: false,
              exportar: false,
            },
            optionCode
          );
        });
      }
    ),
    test(
      'cambiar clave solo habilita consultar y editar',
      () => {
        assert.deepEqual(
          getPerfilOpcionPermissionAvailability(
            createOption('mCambiarClave')
          ),
          {
            consultar: true,
            insertar: false,
            editar: true,
            eliminar: false,
            exportar: false,
          }
        );

        assert.deepEqual(
          sanitizePerfilOpcionPermissions(
            createOption('mCambiarClave'),
            {
              consultar: true,
              insertar: true,
              editar: true,
              eliminar: true,
              exportar: true,
            }
          ),
          {
            consultar: true,
            insertar: false,
            editar: true,
            eliminar: false,
            exportar: false,
          }
        );
      }
    ),
    test(
      'mantiene temporalmente todos los permisos en opciones aún no revisadas',
      () => {
        assert.deepEqual(
          getPerfilOpcionPermissionAvailability(
            createOption('mGestionDeudor')
          ),
          {
            consultar: true,
            insertar: true,
            editar: true,
            eliminar: true,
            exportar: true,
          }
        );
      }
    ),
    test(
      'limpia permisos no soportados antes de persistirlos',
      () => {
        assert.deepEqual(
          sanitizePerfilOpcionPermissions(
            createOption('mMantenerPerfil'),
            {
              consultar: true,
              insertar: true,
              editar: true,
              eliminar: true,
              exportar: true,
            }
          ),
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
