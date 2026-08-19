import assert from 'node:assert/strict';

import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control';

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
  idModulo: number,
  codigo = 'mCodigoEditable'
): OpcionTreeItem => ({
  idModulo,
  nombre: 'Opción',
  descripcion: '',
  codigo,
  ruta: 'root/opcion/',
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
      'los mantenimientos revisados se reconocen por nId_Opcion aunque cambie su código',
      () => {
        const optionIds = [
          APPLICATION_OPTION_IDS
            .MANTENER_PERFIL,
          APPLICATION_OPTION_IDS
            .MANTENER_MODULO,
          APPLICATION_OPTION_IDS
            .MANTENER_GRUPO,
          APPLICATION_OPTION_IDS
            .MANTENER_ACCESOS_POR_PERFIL,
          APPLICATION_OPTION_IDS
            .MANTENER_ACCESOS_POR_USUARIO,
        ];

        optionIds.forEach((optionId) => {
          assert.deepEqual(
            getPerfilOpcionPermissionAvailability(
              createOption(
                optionId,
                `mRenombrado${optionId}`
              )
            ),
            {
              consultar: true,
              insertar: true,
              editar: true,
              eliminar: false,
              exportar: false,
            },
            String(optionId)
          );
        });
      }
    ),
    test(
      'cambiar clave solo habilita consultar y editar',
      () => {
        const option = createOption(
          APPLICATION_OPTION_IDS
            .CAMBIAR_CLAVE,
          'mActualizarCredencial'
        );

        assert.deepEqual(
          getPerfilOpcionPermissionAvailability(
            option
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
            option,
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
            createOption(
              APPLICATION_OPTION_IDS
                .GESTION_DEUDOR
            )
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
            createOption(
              APPLICATION_OPTION_IDS
                .MANTENER_PERFIL
            ),
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
