import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import {
  normalizeAnioCartera,
  normalizeAniosByClienteResponse,
  normalizeCarteraParametro,
  normalizeCarterasParametrosByClienteAnioResponse,
} from './carteraApi.guard';

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

export const suite = defineSuite('carteraApi.guard', [
  test('normaliza un año válido', () => {
    assert.equal(normalizeAnioCartera({ anio: 2026 }), 2026);
  }),
  test('mantiene el orden de los años recibido desde la API', () => {
    assert.deepEqual(
      normalizeAniosByClienteResponse(
        createResponse([
          { anio: 2026 },
          { anio: 2025 },
          { anio: 2024 },
        ])
      ),
      [2026, 2025, 2024]
    );
  }),
  test('rechaza años inválidos', () => {
    for (const anio of [null, '2026', 0, 1899, 2026.5, 10000]) {
      assert.throws(
        () => normalizeAnioCartera({ anio }),
        /años no contiene datos válidos/i
      );
    }
  }),
  test('rechaza sobres y colecciones inválidos', () => {
    for (const response of [
      null,
      [],
      'respuesta',
      { statusCode: '200', code: '00', response: [] },
      createResponse(null),
    ]) {
      assert.throws(
        () => normalizeAniosByClienteResponse(response),
        /años no contiene datos válidos/i
      );
    }
  }),
  test('normaliza las carteras de parámetros del cliente y año', () => {
    assert.deepEqual(
      normalizeCarterasParametrosByClienteAnioResponse(
        createResponse([
          {
            campanna: 1,
            anio: 2026,
            desEstado: ' Vigente ',
            numero: 0,
          },
        ])
      ),
      [
        {
          campania: 1,
          anio: 2026,
          estado: 'Vigente',
          numero: 0,
        },
      ]
    );
  }),
  test('rechaza carteras con datos incompletos o inválidos', () => {
    for (const cartera of [
      null,
      { campanna: '1', anio: 2026, desEstado: 'Vigente', numero: 0 },
      { campanna: 1, anio: 0, desEstado: 'Vigente', numero: 0 },
      { campanna: 1, anio: 2026, desEstado: '', numero: 0 },
      { campanna: 1, anio: 2026, desEstado: 'Vigente', numero: -1 },
    ]) {
      assert.throws(
        () => normalizeCarteraParametro(cartera),
        /carteras no contiene datos válidos/i
      );
    }
  }),
  test('prioriza messageUser cuando la API de carteras rechaza la consulta', () => {
    assert.throws(
      () =>
        normalizeCarterasParametrosByClienteAnioResponse({
          ...createResponse([]),
          code: '01',
          message: 'Detalle técnico',
          messageUser: 'No se encontraron carteras',
        }),
      /No se encontraron carteras/
    );
  }),
  test('prioriza messageUser cuando la API rechaza la consulta', () => {
    assert.throws(
      () =>
        normalizeAniosByClienteResponse({
          ...createResponse([]),
          code: '01',
          message: 'Detalle técnico',
          messageUser: 'No se encontraron años para el cliente',
        }),
      /No se encontraron años para el cliente/
    );
  }),
]);
