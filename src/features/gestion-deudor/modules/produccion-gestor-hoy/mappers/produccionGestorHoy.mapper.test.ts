import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import { mapProduccionGestorHoyResponse } from './produccionGestorHoy.mapper';
import type {
  GetProduccionGestorHoyResponse,
  ProduccionGestorHoyApi,
} from '../types/produccionGestorHoy.types';

const createItem = (
  overrides: Partial<ProduccionGestorHoyApi> = {}
): ProduccionGestorHoyApi => ({
  hora: '09:00',
  total: 10,
  ges4: 4,
  ges15: 2,
  ges13: 1,
  ges4b: 2,
  ges0: 1,
  ...overrides,
});

const createResponse = (
  response: GetProduccionGestorHoyResponse['response']
): GetProduccionGestorHoyResponse => ({
  code: 'OK',
  message: '',
  messageUser: '',
  statusCode: 200,
  pageNumber: 1,
  pageSize: 100,
  totalRecords: Array.isArray(response) ? response.length : response ? 1 : 0,
  totalPages: 1,
  response,
});

export const suite = defineSuite('produccionGestorHoy.mapper', [
  test('mapea las métricas de producción con sus nombres de pantalla', () => {
    const [row] = mapProduccionGestorHoyResponse(
      createResponse(createItem())
    );

    assert.deepEqual(row, {
      hora: '09:00',
      totalGestionesTelefonicas: 10,
      contactos: 4,
      busquedas: 2,
      sms: 1,
      noContactos: 2,
      otros: 1,
    });
  }),
  test('acepta respuestas de arreglo y de objeto único', () => {
    const arrayRows = mapProduccionGestorHoyResponse(
      createResponse([createItem({ hora: '09:00' }), createItem({ hora: '10:00' })])
    );
    const singleRows = mapProduccionGestorHoyResponse(
      createResponse(createItem({ hora: '11:00' }))
    );

    assert.deepEqual(arrayRows.map((row) => row.hora), ['09:00', '10:00']);
    assert.deepEqual(singleRows.map((row) => row.hora), ['11:00']);
  }),
  test('normaliza respuestas nulas y métricas inválidas', () => {
    assert.deepEqual(mapProduccionGestorHoyResponse(createResponse(null)), []);

    const [row] = mapProduccionGestorHoyResponse(
      createResponse(createItem({
        total: 'invalido' as unknown as number,
        hora: ' 12:00 ',
      }))
    );

    assert.equal(row?.totalGestionesTelefonicas, 0);
    assert.equal(row?.hora, '12:00');
  }),
]);
