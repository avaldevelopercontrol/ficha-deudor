import assert from 'node:assert/strict';

import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import type {
  AccessTreeItem,
} from './access.types';

import {
  getAccessPermissionAvailability,
  sanitizeAccessPermissions,
} from './accessCapabilities.utils';

const createOption = (
  idModulo: number,
  codigo = 'mCodigoEditable'
): AccessTreeItem => ({
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
            .MANTENER_USUARIO,
          APPLICATION_OPTION_IDS
            .MANTENER_ACCESOS_POR_PERFIL,
          APPLICATION_OPTION_IDS
            .MANTENER_ACCESOS_POR_USUARIO,
        ];

        optionIds.forEach((optionId) => {
          assert.deepEqual(
            getAccessPermissionAvailability(
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
      'Mantener usuario habilita consultar insertar y editar, pero no eliminar ni exportar',
      () => {
        const option = createOption(
          APPLICATION_OPTION_IDS
            .MANTENER_USUARIO
        );

        assert.deepEqual(
          getAccessPermissionAvailability(
            option
          ),
          {
            consultar: true,
            insertar: true,
            editar: true,
            eliminar: false,
            exportar: false,
          }
        );

        assert.deepEqual(
          sanitizeAccessPermissions(
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
            insertar: true,
            editar: true,
            eliminar: false,
            exportar: false,
          }
        );
      }
    ),
    test(
      'Análisis de Carteras y Reportería solo habilitan consultar',
      () => {
        [
          APPLICATION_OPTION_IDS
            .PORTFOLIO_CONTROL_CENTER,
          APPLICATION_OPTION_IDS
            .REPORTERIA,
        ].forEach((optionId) => {
          const option = createOption(
            optionId
          );

          assert.deepEqual(
            getAccessPermissionAvailability(
              option
            ),
            {
              consultar: true,
              insertar: false,
              editar: false,
              eliminar: false,
              exportar: false,
            }
          );

          assert.deepEqual(
            sanitizeAccessPermissions(
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
              editar: false,
              eliminar: false,
              exportar: false,
            }
          );
        });
      }
    ),
    test(
      'cualquier módulo Power BI se limita dinámicamente a consultar',
      () => {
        const option = {
          ...createOption(999),
          nombre: 'Power BI futuro',
          urlBI:
            'https://app.powerbi.com/view?r=demo',
        };

        assert.deepEqual(
          getAccessPermissionAvailability(
            option
          ),
          {
            consultar: true,
            insertar: false,
            editar: false,
            eliminar: false,
            exportar: false,
          }
        );

        assert.deepEqual(
          sanitizeAccessPermissions(
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
            editar: false,
            eliminar: false,
            exportar: false,
          }
        );
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
          getAccessPermissionAvailability(
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
          sanitizeAccessPermissions(
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
          getAccessPermissionAvailability(
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
          sanitizeAccessPermissions(
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
