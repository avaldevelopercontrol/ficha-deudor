import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  Cliente,
} from '../types/auth.types';

import {
  resolveClienteGrupoId,
} from './clienteGrupo.utils';

const createCliente = (
  idCliente: string
): Cliente => ({
  id_cliente: idCliente,
  nombre:
    idCliente === '95'
      ? 'CLARO CORPORATIVO'
      : 'OTRO',
  codigo: 'TEST',
  activa: true,
});

export const suite = defineSuite(
  'clienteGrupo.utils',
  [
    test(
      'resuelve temporalmente cliente 95 como grupo 156',
      () => {
        assert.equal(
          resolveClienteGrupoId(
            createCliente('95')
          ),
          156
        );
      }
    ),
    test(
      'no inventa un grupo para clientes sin equivalencia temporal',
      () => {
        assert.equal(
          resolveClienteGrupoId(
            createCliente('100')
          ),
          null
        );
      }
    ),
  ]
);
