import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  AccessOptionSource,
  ProfileOptionAccessSource,
  UserGroupOptionAccessSource,
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

const special = (
  assignmentId: number,
  userId: number,
  groupId: number,
  optionId: number,
  overrides: Partial<
    UserGroupOptionAccessSource
  > = {}
): UserGroupOptionAccessSource => ({
  assignmentId,
  userId,
  groupId,
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
          snapshot.optionsById.get(
            11
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
                30,
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
              allow(5, 9, 30),
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
          snapshot.optionsById.size,
          3
        );
        assert.equal(
          snapshot.optionsById.get(
            12
          )?.permissions.consultar,
          false
        );
        assert.equal(
          snapshot.optionsById.has(
            30
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
      'prioriza los permisos especiales activos del usuario y grupo sobre los del perfil',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(1, 'Root', 'Root', 1, 0, 0),
              option(2, 'mSeguridad', 'Seguridad', 2, 1, 1),
              option(10, 'mMantenerPerfil', 'Mantener perfil', 3, 2, 1),
            ],
            [
              allow(1, 9, 2),
              allow(2, 9, 10, {
                permissions: {
                  consultar: true,
                  insertar: true,
                  editar: true,
                  eliminar: true,
                  exportar: true,
                },
              }),
            ],
            [
              special(50, 14931, 156, 10, {
                permissions: {
                  consultar: true,
                  insertar: false,
                  editar: false,
                  eliminar: false,
                  exportar: false,
                },
              }),
            ]
          );

        assert.deepEqual(
          snapshot.optionsById.get(
            10
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
      'usa el perfil cuando la relación especial está inactiva',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(1, 'Root', 'Root', 1, 0, 0),
              option(2, 'mSeguridad', 'Seguridad', 2, 1, 1),
              option(10, 'mMantenerPerfil', 'Mantener perfil', 3, 2, 1),
            ],
            [
              allow(1, 9, 2),
              allow(2, 9, 10, {
                permissions: {
                  consultar: true,
                  insertar: true,
                  editar: false,
                  eliminar: false,
                  exportar: false,
                },
              }),
            ],
            [
              special(50, 14931, 156, 10, {
                active: false,
                permissions: {
                  consultar: false,
                  insertar: false,
                  editar: false,
                  eliminar: false,
                  exportar: false,
                },
              }),
            ]
          );

        assert.equal(
          snapshot.optionsById.get(
            10
          )?.permissions.insertar,
          true
        );
      }
    ),
    test(
      'permite que un acceso especial activo agregue una opción que el perfil no tenía',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(1, 'Root', 'Root', 1, 0, 0),
              option(2, 'mSeguridad', 'Seguridad', 2, 1, 1),
              option(10, 'mMantenerPerfil', 'Mantener perfil', 3, 2, 1),
            ],
            [allow(1, 9, 2)],
            [special(50, 14931, 156, 10)]
          );

        assert.equal(
          snapshot.optionsById.has(
            10
          ),
          true
        );
      }
    ),
    test(
      'respeta una restricción especial activa aunque deje todos los permisos en false',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(1, 'Root', 'Root', 1, 0, 0),
              option(2, 'mSeguridad', 'Seguridad', 2, 1, 1),
              option(10, 'mMantenerPerfil', 'Mantener perfil', 3, 2, 1),
            ],
            [
              allow(1, 9, 2),
              allow(2, 9, 10, {
                permissions: {
                  consultar: true,
                  insertar: true,
                  editar: true,
                  eliminar: true,
                  exportar: true,
                },
              }),
            ],
            [
              special(50, 14931, 156, 10, {
                permissions: {
                  consultar: false,
                  insertar: false,
                  editar: false,
                  eliminar: false,
                  exportar: false,
                },
              }),
            ]
          );

        assert.deepEqual(
          snapshot.optionsById.get(
            10
          )?.permissions,
          {
            consultar: false,
            insertar: false,
            editar: false,
            eliminar: false,
            exportar: false,
          }
        );
      }
    ),
    test(
      'mantiene navegable una pantalla cuando su módulo padre pasa a ser hijo de otro módulo',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(1, 'Root', 'Root', 1, 0, 0),
              option(2, 'mSeguridad', 'Seguridad', 2, 1, 1),
              option(5, 'mGestionDeUsuarios', 'Gestión de usuarios', 3, 2, 1),
              option(20, 'mAdministrarUsuarios', 'Administrar usuarios', 4, 5, 1),
            ],
            [
              allow(1, 9, 2),
              allow(2, 9, 5),
              allow(3, 9, 20),
            ]
          );

        const seguridad =
          snapshot.navigationTree[0];
        const gestionUsuarios =
          seguridad?.children[0];
        const mantenerUsuario =
          gestionUsuarios?.children[0];

        assert.equal(
          seguridad?.id,
          2
        );
        assert.equal(
          gestionUsuarios?.id,
          5
        );
        assert.equal(
          mantenerUsuario?.id,
          20
        );
        assert.equal(
          mantenerUsuario?.route,
          '/gestion-usuarios/mantener-usuario'
        );
      }
    ),
    test(
      'mantiene la ruta React por Id aunque nombre y código cambien en la base de datos',
      () => {
        const snapshot =
          buildAccessControlSnapshot(
            9,
            [
              option(1, 'Root', 'Root', 1, 0, 0),
              option(5, 'mGestionDeUsuarios', 'Gestión de usuarios', 2, 1, 1),
              option(20, 'mAdministrarUsuarios', 'Administrar usuarios', 3, 5, 1),
            ],
            [
              allow(1, 9, 5),
              allow(2, 9, 20),
            ]
          );

        const usuarioOption =
          snapshot.optionsById.get(20);

        assert.ok(usuarioOption);
        assert.equal(
          usuarioOption.code,
          'mAdministrarUsuarios'
        );
        assert.equal(
          usuarioOption.name,
          'Administrar usuarios'
        );
        assert.equal(
          usuarioOption.route,
          '/gestion-usuarios/mantener-usuario'
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

        assert.throws(
          () =>
            buildAccessControlSnapshot(
              9,
              [
                option(1, 'Root', 'Root', 1, 0, 0),
                option(4, 'mGestionDeCobranzas', 'Gestión de cobranzas', 2, 1, 1),
              ],
              [allow(1, 9, 4)],
              [
                special(50, 14931, 156, 4),
                special(51, 14931, 156, 4),
              ]
            ),
          /más de un acceso especial registrado/i
        );
      }
    )
  ]
);
