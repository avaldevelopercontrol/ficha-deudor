import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import { createCliente } from '../../../test/factories/auth.factory';
import {
  normalizeGrupoClienteInicial,
  normalizeGruposClienteInicialResponse,
} from './clienteApi.guard';

const createResponse = (response: unknown) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  pageNumber: 0,
  pageSize: 0,
  totalRecords: 0,
  totalPages: 0,
  response,
});

export const suite = defineSuite('clienteApi.guard', [
  test('normaliza identificadores de cliente, grupo y nombre', () => {
    assert.deepEqual(
      normalizeGrupoClienteInicial({
        nId_Cliente: 95,
        cCli_Nombre: ' CLARO CORPORATIVO ',
        nId_Grupo: 156,
      }),
      createCliente()
    );
  }),
  test('normaliza una respuesta completa sin alterar el orden', () => {
    assert.deepEqual(
      normalizeGruposClienteInicialResponse(
        createResponse([
          {
            nId_Cliente: 1,
            cCli_Nombre: 'Cliente uno',
            nId_Grupo: 10,
          },
          {
            nId_Cliente: 2,
            cCli_Nombre: 'Cliente dos',
            nId_Grupo: 20,
          },
        ])
      ),
      [
        createCliente({
          id_cliente: '1',
          id_grupo: 10,
          nombre: 'Cliente uno',
        }),
        createCliente({
          id_cliente: '2',
          id_grupo: 20,
          nombre: 'Cliente dos',
        }),
      ]
    );
  }),
  test('conserva relaciones distintas para un mismo cliente', () => {
    assert.deepEqual(
      normalizeGruposClienteInicialResponse(
        createResponse([
          {
            nId_Cliente: 27,
            cCli_Nombre: 'BACKUS',
            nId_Grupo: 22,
          },
          {
            nId_Cliente: 27,
            cCli_Nombre: 'BACKUS',
            nId_Grupo: 168,
          },
        ])
      ),
      [
        createCliente({
          id_cliente: '27',
          id_grupo: 22,
          nombre: 'BACKUS',
        }),
        createCliente({
          id_cliente: '27',
          id_grupo: 168,
          nombre: 'BACKUS',
        }),
      ]
    );
  }),
  test('rechaza identificadores de cliente inválidos', () => {
    for (const id_cliente of ['', '0', '-1', '1.5', 'abc', null]) {
      assert.throws(
        () =>
          normalizeGrupoClienteInicial({
            nId_Cliente: id_cliente,
            cCli_Nombre: 'CLARO CORPORATIVO',
            nId_Grupo: 156,
          }),
        /clientes no contiene datos válidos/i
      );
    }
  }),
  test('rechaza identificadores de grupo inválidos', () => {
    for (const id_grupo of ['', '0', '-1', '1.5', 'abc', null]) {
      assert.throws(
        () =>
          normalizeGrupoClienteInicial({
            nId_Cliente: 95,
            cCli_Nombre: 'CLARO CORPORATIVO',
            nId_Grupo: id_grupo,
          }),
        /clientes no contiene datos válidos/i
      );
    }
  }),
  test('rechaza nombres inválidos', () => {
    assert.throws(
      () =>
        normalizeGrupoClienteInicial({
          nId_Cliente: 95,
          cCli_Nombre: '   ',
          nId_Grupo: 156,
        }),
      /clientes no contiene datos válidos/i
    );
  }),
  test('rechaza sobres y colecciones con formato inválido', () => {
    for (const response of [
      null,
      [],
      'respuesta',
      { statusCode: '200', response: [] },
      createResponse(null),
    ]) {
      assert.throws(
        () => normalizeGruposClienteInicialResponse(response),
        /clientes no contiene datos válidos/i
      );
    }
  }),
  test('prioriza el mensaje de usuario cuando la API informa un error', () => {
    assert.throws(
      () =>
        normalizeGruposClienteInicialResponse({
          ...createResponse([]),
          code: '01',
          message: 'Detalle técnico',
          messageUser: 'No se pudieron cargar los clientes',
        }),
      /No se pudieron cargar los clientes/
    );
  }),
]);
