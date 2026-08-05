import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  AccessOptionSource,
  ProfileOptionAccessSource,
} from '../types/accessControl.types';

import {
  buildAccessControlSnapshot,
} from './accessControl.utils';

const allow = (
  assignmentId: number,
  profileId: number,
  optionId: number,
  overrides: Partial<
    ProfileOptionAccessSource
  > = {}
): ProfileOptionAccessSource => ({
  assignmentId,
  profileId,
  optionId,
  permissions: {
    consultar: true,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  },
  active: true,
  ...overrides,
});

const option = (
  id: number,
  code: string,
  name: string,
  type: number,
  parentId: number,
  order: number,
  overrides: Partial<
    AccessOptionSource
  > = {}
): AccessOptionSource => ({
  id,
  code,
  name,
  description: '',
  icon: 'module-default',
  type,
  parentId,
  order,
  visible: true,
  active: true,
  ...overrides,
});

export const suite = defineSuite(
  'accessControl.utils',
  [
    test(
      'construye el árbol autorizado y conserva los permisos del perfil',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(
                1,
                'Root',
                'Root',
                1,
                0,
                0
              ),
              option(
                2,
                'mSeguridad',
                'Seguridad',
                2,
                1,
                2,
                {
                  icon:
                    '/candado.ico',
                }
              ),
              option(
                10,
                'mMantenerPerfil',
                'Mantener perfil',
                3,
                2,
                2
              ),
              option(
                11,
                'mMantenerModulo',
                'Mantener módulo',
                3,
                2,
                1
              ),
            ],
            [
              allow(1, 9, 2),
              allow(2, 9, 10),
              allow(3, 9, 11, {
                permissions: {
                  consultar: true,
                  insertar: true,
                  editar: true,
                  eliminar: false,
                  exportar: true,
                },
              }),
            ]
          );

        assert.equal(
          snapshot.menuTree.length,
          1
        );

        assert.equal(
          snapshot.navigationTree.length,
          1
        );

        const seguridad =
          snapshot.navigationTree[0];

        assert.ok(seguridad);
        assert.equal(
          seguridad.code,
          'mSeguridad'
        );
        assert.equal(
          seguridad.icon,
          'shield'
        );
        assert.deepEqual(
          seguridad.children.map(
            (child) => child.code
          ),
          [
            'mMantenerModulo',
            'mMantenerPerfil',
          ]
        );

        const mantenerModulo =
          snapshot.optionsByCode.get(
            'mMantenerModulo'
          );

        assert.ok(mantenerModulo);
        assert.equal(
          mantenerModulo.route,
          '/seguridad/mantener-modulos'
        );
        assert.equal(
          mantenerModulo.permissions
            .editar,
          true
        );
        assert.equal(
          mantenerModulo.permissions
            .eliminar,
          false
        );
      }
    ),
    test(
      'conserva opciones asignadas sin permiso de consulta y bloquea la navegación mediante sus permisos',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(
                1,
                'Root',
                'Root',
                1,
                0,
                0
              ),
              option(
                2,
                'mSeguridad',
                'Seguridad',
                2,
                1,
                1
              ),
              option(
                10,
                'mMantenerPerfil',
                'Mantener perfil',
                3,
                2,
                1,
                {
                  active: false,
                }
              ),
              option(
                11,
                'mMantenerModulo',
                'Mantener módulo',
                3,
                2,
                2,
                {
                  visible: false,
                }
              ),
              option(
                12,
                'mMantenerAccesosPorPerfil',
                'Mantener accesos',
                3,
                2,
                3
              ),
              option(
                13,
                'mOpcionSinPantalla',
                'Sin pantalla',
                3,
                2,
                4
              ),
            ],
            [
              allow(1, 9, 2),
              allow(2, 9, 10),
              allow(3, 9, 11),
              allow(4, 9, 12, {
                permissions: {
                  consultar: false,
                  insertar: true,
                  editar: true,
                  eliminar: true,
                  exportar: true,
                },
              }),
              allow(5, 9, 13),
            ]
          );

        assert.equal(
          snapshot.menuTree.length,
          1
        );

        const seguridad =
          snapshot.menuTree[0];

        assert.ok(seguridad);
        assert.deepEqual(
          seguridad.children.map(
            (child) => child.code
          ),
          [
            'mMantenerAccesosPorPerfil',
            'mOpcionSinPantalla',
          ]
        );

        assert.equal(
          snapshot.navigationTree.length,
          1
        );

        assert.deepEqual(
          snapshot.navigationTree[0]
            ?.children.map(
              (child) => child.code
            ),
          ['mMantenerAccesosPorPerfil']
        );

        assert.equal(
          snapshot.optionsByCode.size,
          3
        );
        assert.equal(
          snapshot.optionsByCode.get(
            'mMantenerAccesosPorPerfil'
          )?.permissions.consultar,
          false
        );
        assert.equal(
          snapshot.optionsByCode.has(
            'mOpcionSinPantalla'
          ),
          true
        );
      }
    ),
    test(
      'no muestra hijos cuando el perfil no tiene habilitado su módulo padre',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(
                1,
                'Root',
                'Root',
                1,
                0,
                0
              ),
              option(
                4,
                'mGestionDeCobranzas',
                'Gestión de cobranzas',
                2,
                1,
                1
              ),
              option(
                13,
                'mGestionDeudor',
                'Gestión deudor',
                3,
                4,
                1
              ),
            ],
            [
              allow(1, 9, 13),
            ]
          );

        assert.deepEqual(
          snapshot.menuTree,
          []
        );
        assert.deepEqual(
          snapshot.navigationTree,
          []
        );
      }
    ),
    test(
      'ignora las relaciones pertenecientes a otro perfil',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(
                1,
                'Root',
                'Root',
                1,
                0,
                0
              ),
              option(
                4,
                'mGestionDeCobranzas',
                'Gestión de cobranzas',
                2,
                1,
                1
              ),
              option(
                13,
                'mGestionDeudor',
                'Gestión deudor',
                3,
                4,
                1
              ),
            ],
            [
              allow(1, 10, 4),
              allow(2, 10, 13),
            ]
          );

        assert.equal(
          snapshot.profileId,
          9
        );
        assert.deepEqual(
          snapshot.menuTree,
          []
        );
        assert.deepEqual(
          snapshot.navigationTree,
          []
        );
      }
    ),
    test(
      'rechaza opciones y accesos duplicados para evitar autorizaciones ambiguas',
      () => {
        assert.throws(
          () =>
            buildAccessControlSnapshot(
              9,
              [
                option(
                  1,
                  'Root',
                  'Root',
                  1,
                  0,
                  0
                ),
                option(
                  2,
                  'mSeguridad',
                  'Seguridad',
                  2,
                  1,
                  1
                ),
                option(
                  2,
                  'mSeguridadDuplicada',
                  'Seguridad duplicada',
                  2,
                  1,
                  2
                ),
              ],
              []
            ),
          /opción 2 está duplicada/i
        );

        assert.throws(
          () =>
            buildAccessControlSnapshot(
              9,
              [
                option(
                  1,
                  'Root',
                  'Root',
                  1,
                  0,
                  0
                ),
                option(
                  4,
                  'mGestionDeCobranzas',
                  'Gestión de cobranzas',
                  2,
                  1,
                  1
                ),
              ],
              [
                allow(1, 9, 4),
                allow(2, 9, 4),
              ]
            ),
          /más de un acceso registrado/i
        );
      }
    )
  ]
);
