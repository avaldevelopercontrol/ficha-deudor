import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import type {
  UsuarioSearchOption,
} from './usuarioSearch.utils';

import {
  filterAvailableUsuarioOptionsForGrupo,
  getAssignedUsuarioIdsForGrupo,
  hasUsuarioGrupoAccess,
} from './accesosUsuarioAvailability.utils';

const buildAcceso = (
  idUsuarioGrupoOpcion: number,
  idUsuario: number,
  idGrupo: number,
  estado: 'Activo' | 'Inactivo' = 'Activo'
): UsuarioGrupoOpcionListado => ({
  idUsuarioGrupoOpcion,
  idUsuario,
  usuario: String(idUsuario),
  nombreCompleto: `Usuario ${idUsuario}`,
  idGrupo,
  grupo: `Grupo ${idGrupo}`,
  idOpcion: 10 + idUsuarioGrupoOpcion,
  codigoOpcion: `opcion-${idUsuarioGrupoOpcion}`,
  opcion: `Opción ${idUsuarioGrupoOpcion}`,
  consultar: true,
  insertar: false,
  editar: false,
  eliminar: false,
  exportar: false,
  estado,
});

const buildOption = (
  id: number
): UsuarioSearchOption => ({
  id,
  label: `Usuario ${id}`,
  login: `user${id}`,
  normalizedLabel: `usuario ${id}`,
  normalizedLogin: `user${id}`,
  searchText: `usuario ${id} user${id} ${id}`,
});

const accesos: UsuarioGrupoOpcionListado[] = [
  buildAcceso(1, 100, 156),
  buildAcceso(2, 100, 156),
  buildAcceso(3, 200, 156, 'Inactivo'),
  buildAcceso(4, 100, 22),
];

export const suite = defineSuite(
  'disponibilidad de usuarios por grupo',
  [
    test(
      'considera configurado al usuario por la combinación usuario y grupo',
      () => {
        assert.equal(
          hasUsuarioGrupoAccess(
            accesos,
            100,
            156
          ),
          true
        );
        assert.equal(
          hasUsuarioGrupoAccess(
            accesos,
            200,
            22
          ),
          false
        );
      }
    ),
    test(
      'considera también las relaciones inactivas para evitar duplicados',
      () => {
        assert.equal(
          hasUsuarioGrupoAccess(
            accesos,
            200,
            156
          ),
          true
        );
      }
    ),
    test(
      'obtiene ids únicos de usuarios ya configurados para el grupo',
      () => {
        assert.deepEqual(
          [
            ...getAssignedUsuarioIdsForGrupo(
              accesos,
              156
            ),
          ].sort((left, right) => left - right),
          [100, 200]
        );
      }
    ),
    test(
      'filtra solo los usuarios disponibles para el grupo seleccionado',
      () => {
        const options = [
          buildOption(100),
          buildOption(200),
          buildOption(300),
        ];

        assert.deepEqual(
          filterAvailableUsuarioOptionsForGrupo(
            options,
            accesos,
            156
          ).map((option) => option.id),
          [300]
        );

        assert.deepEqual(
          filterAvailableUsuarioOptionsForGrupo(
            options,
            accesos,
            22
          ).map((option) => option.id),
          [200, 300]
        );
      }
    ),
    test(
      'no ofrece usuarios hasta seleccionar un grupo válido',
      () => {
        assert.deepEqual(
          filterAvailableUsuarioOptionsForGrupo(
            [buildOption(100)],
            accesos,
            ''
          ),
          []
        );
      }
    ),
  ]
);
