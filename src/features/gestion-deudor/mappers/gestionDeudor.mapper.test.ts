import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { createDeudorGestionApi } from '../../../test/factories/gestionDeudor.factory';
import {
  mapDeudorGestionDeudor,
  mapDeudoresGestionDeudorResponse,
} from './gestionDeudor.mapper';
import type { GetDeudoresGestionDeudorResponse } from '../types/gestionDeudor.types';

const createResponse = (
  response: GetDeudoresGestionDeudorResponse['response']
): GetDeudoresGestionDeudorResponse => ({
  code: 'OK',
  message: '',
  messageUser: '',
  statusCode: 200,
  pageNumber: 1,
  pageSize: 1000,
  totalRecords: Array.isArray(response) ? response.length : response ? 1 : 0,
  totalPages: 1,
  response,
});

export const suite = defineSuite('gestionDeudor.mapper', [
  test('normaliza textos y valores numéricos recibidos por la API', () => {
    const row = mapDeudorGestionDeudor(
      createDeudorGestionApi({
        nId_PersDeudor: '301' as unknown as number,
        saldo: '900.25' as unknown as number,
        deudor: null as unknown as string,
      })
    );

    assert.equal(row.nId_PersDeudor, 301);
    assert.equal(row.saldo, 900.25);
    assert.equal(row.deudor, '');
  }),
  test('mapea respuestas con múltiples registros', () => {
    const rows = mapDeudoresGestionDeudorResponse(
      createResponse([
        createDeudorGestionApi({ nId_PersDeudor: 301 }),
        createDeudorGestionApi({ nId_PersDeudor: 302 }),
      ])
    );

    assert.deepEqual(
      rows.map((row) => row.nId_PersDeudor),
      [301, 302]
    );
  }),
  test('mantiene compatibilidad con una respuesta de objeto único', () => {
    const rows = mapDeudoresGestionDeudorResponse(
      createResponse(createDeudorGestionApi({ nId_PersDeudor: 401 }))
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.nId_PersDeudor, 401);
  }),
  test('convierte una respuesta nula en una colección vacía', () => {
    assert.deepEqual(
      mapDeudoresGestionDeudorResponse(createResponse(null)),
      []
    );
  }),
  test('mantiene cero únicamente para el cliente opcional del registro', () => {
    const row = mapDeudorGestionDeudor(
      createDeudorGestionApi({ nId_Cliente: 0 })
    );

    assert.equal(row.nId_Cliente, 0);
  }),
  test('rechaza identificadores principales inválidos en lugar de convertirlos en cero', () => {
    for (const overrides of [
      { nId_PersDeudor: 0 },
      { nId_Contrato: -1 },
      { nId_Cartera: 'abc' as unknown as number },
      { nId_Cliente: 'abc' as unknown as number },
    ]) {
      assert.throws(
        () =>
          mapDeudorGestionDeudor(
            createDeudorGestionApi(overrides)
          ),
        /identificador/
      );
    }
  }),
  test('convierte valores numéricos inválidos en cero según el contrato actual', () => {
    const row = mapDeudorGestionDeudor(
      createDeudorGestionApi({
        importe: 'no-numérico' as unknown as number,
        cantidadGestionCALL: Number.NaN,
      })
    );

    assert.equal(row.importe, 0);
    assert.equal(row.cantidadGestionCALL, 0);
  }),
]);
