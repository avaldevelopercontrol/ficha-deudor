import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import { createCliente } from '../../../test/factories/auth.factory';
import {
  normalizeCliente,
  normalizeClientesResponse,
} from './clienteApi.guard';

export const suite = defineSuite('clienteApi.guard', [
  test('normaliza identificadores y textos válidos del cliente', () => {
    assert.deepEqual(
      normalizeCliente({
        id_cliente: ' 95 ',
        nombre: ' CLARO CORPORATIVO ',
        codigo: ' CLARO ',
        activa: true,
      }),
      createCliente()
    );
  }),
  test('normaliza una respuesta completa sin alterar el orden', () => {
    const primero = createCliente({
      id_cliente: '1',
      nombre: 'Cliente uno',
      codigo: 'UNO',
    });
    const segundo = createCliente({
      id_cliente: '2',
      nombre: 'Cliente dos',
      codigo: 'DOS',
      activa: false,
    });

    assert.deepEqual(
      normalizeClientesResponse({
        success: true,
        clientes: [primero, segundo],
      }),
      {
        success: true,
        clientes: [primero, segundo],
      }
    );
  }),
  test('rechaza identificadores de cliente inválidos', () => {
    for (const id_cliente of ['', '0', '-1', '1.5', 'abc', null]) {
      assert.throws(
        () =>
          normalizeCliente({
            ...createCliente(),
            id_cliente,
          }),
        /clientes no contiene datos válidos/i
      );
    }
  }),
  test('rechaza nombres códigos y estados manipulados', () => {
    assert.throws(
      () => normalizeCliente({ ...createCliente(), nombre: '   ' }),
      /clientes no contiene datos válidos/i
    );
    assert.throws(
      () => normalizeCliente({ ...createCliente(), codigo: null }),
      /clientes no contiene datos válidos/i
    );
    assert.throws(
      () => normalizeCliente({ ...createCliente(), activa: 1 }),
      /clientes no contiene datos válidos/i
    );
  }),
  test('rechaza sobres y colecciones con formato inválido', () => {
    for (const response of [
      null,
      [],
      'respuesta',
      { success: 'true', clientes: [] },
      { success: true, clientes: null },
    ]) {
      assert.throws(
        () => normalizeClientesResponse(response),
        /clientes no contiene datos válidos/i
      );
    }
  }),
]);
