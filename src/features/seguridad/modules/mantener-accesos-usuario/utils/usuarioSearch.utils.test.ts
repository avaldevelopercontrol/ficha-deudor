import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  UsuarioListado,
} from '@features/gestion-usuarios/types/usuarioListado.types';

import {
  buildActiveUsuarioSearchOptions,
  buildUsuarioSearchOptions,
  searchUsuarioOptions,
} from './usuarioSearch.utils';

const usuarios: UsuarioListado[] = [
  {
    id: 2,
    nombre: 'Álvarez Pérez José',
    login: 'jalvarez',
    estado: 'ACTIVO',
    perfil: 'GESTOR',
    codigoRecaudacion: '',
  },
  {
    id: 1,
    nombre: 'Baella Ayulo Anel Vanessa',
    login: 'abaella',
    estado: 'ACTIVO',
    perfil: 'GESTOR',
    codigoRecaudacion: '',
  },
  {
    id: 3,
    nombre: 'Carlos Ramos',
    login: 'cramos',
    estado: 'ACTIVO',
    perfil: 'GESTOR',
    codigoRecaudacion: '',
  },
];

export const suite = defineSuite(
  'usuarioSearch.utils',
  [
    test(
      'construye opciones ordenadas y conserva nombre y login separados',
      () => {
        const options =
          buildUsuarioSearchOptions(
            usuarios
          );

        assert.deepEqual(
          options.map(
            ({ id, label, login }) => ({
              id,
              label,
              login,
            })
          ),
          [
            {
              id: 2,
              label:
                'Álvarez Pérez José',
              login: 'jalvarez',
            },
            {
              id: 1,
              label:
                'Baella Ayulo Anel Vanessa',
              login: 'abaella',
            },
            {
              id: 3,
              label: 'Carlos Ramos',
              login: 'cramos',
            },
          ]
        );
      }
    ),
    test(
      'construye el catálogo de asignación únicamente con usuarios activos',
      () => {
        const options =
          buildActiveUsuarioSearchOptions([
            ...usuarios,
            {
              id: 4,
              nombre: 'Usuario Inactivo',
              login: 'inactivo',
              estado: 'INACTIVO',
              perfil: 'GESTOR',
              codigoRecaudacion: '',
            },
          ]);

        assert.deepEqual(
          options.map((option) => option.id),
          [2, 1, 3]
        );
      }
    ),
    test(
      'busca por nombre o login ignorando mayúsculas y tildes',
      () => {
        const options =
          buildUsuarioSearchOptions(
            usuarios
          );

        assert.deepEqual(
          searchUsuarioOptions(
            options,
            'alvarez'
          ).options.map(
            (option) => option.id
          ),
          [2]
        );

        assert.deepEqual(
          searchUsuarioOptions(
            options,
            'ABAELLA'
          ).options.map(
            (option) => option.id
          ),
          [1]
        );
      }
    ),
    test(
      'permite buscar por varias palabras aunque no sean consecutivas',
      () => {
        const options =
          buildUsuarioSearchOptions([
            ...usuarios,
            {
              id: 4,
              nombre:
                'Junior Abraham Perez Huamani',
              login: 'jperez',
              estado: 'ACTIVO',
              perfil: 'ADMIN',
              codigoRecaudacion: '',
            },
          ]);

        assert.deepEqual(
          searchUsuarioOptions(
            options,
            'junior perez'
          ).options.map(
            (option) => option.id
          ),
          [4]
        );

        assert.deepEqual(
          searchUsuarioOptions(
            options,
            'PEREZ junior'
          ).options.map(
            (option) => option.id
          ),
          [4]
        );
      }
    ),
    test(
      'limita los elementos renderizados sin perder el total de coincidencias',
      () => {
        const options =
          buildUsuarioSearchOptions(
            usuarios
          );
        const result =
          searchUsuarioOptions(
            options,
            '',
            2
          );

        assert.equal(
          result.options.length,
          2
        );
        assert.equal(
          result.totalMatches,
          3
        );
      }
    ),
  ]
);
