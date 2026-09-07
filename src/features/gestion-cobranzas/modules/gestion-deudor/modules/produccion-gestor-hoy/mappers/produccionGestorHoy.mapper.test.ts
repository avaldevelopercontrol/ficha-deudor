import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../../../test/testHarness';
import { mapProduccionGestorHoyResponse } from './produccionGestorHoy.mapper';
import type {
  ProduccionGestorHoyApi,
} from '../api/produccionGestorHoyApi.types';

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

export const suite = defineSuite('produccionGestorHoy.mapper', [
  test('mapea las métricas de producción con sus nombres de pantalla', () => {
    const [row] = mapProduccionGestorHoyResponse(
      createItem()
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
    const arrayRows = mapProduccionGestorHoyResponse([
      createItem({ hora: '09:00' }),
      createItem({ hora: '10:00' }),
    ]);
    const singleRows = mapProduccionGestorHoyResponse(
      createItem({ hora: '11:00' })
    );

    assert.deepEqual(
      arrayRows.map((row) => row.hora),
      ['09:00', '10:00']
    );
    assert.deepEqual(
      singleRows.map((row) => row.hora),
      ['11:00']
    );
  }),
  test('normaliza respuestas nulas y métricas inválidas', () => {
    assert.deepEqual(
      mapProduccionGestorHoyResponse(null),
      []
    );

    const [row] = mapProduccionGestorHoyResponse(
      createItem({
        total: 'invalido',
        hora: ' 12:00 ',
      })
    );

    assert.equal(row?.totalGestionesTelefonicas, 0);
    assert.equal(row?.hora, '12:00');
  }),
  test('rechaza filas primitivas y registros incompletos', () => {
    assert.throws(
      () => mapProduccionGestorHoyResponse(['09:00']),
      /respuesta del servidor no contiene datos válidos/i
    );

    const incompleteRow = {
      ...createItem(),
    };
    Reflect.deleteProperty(
      incompleteRow,
      'ges0'
    );

    assert.throws(
      () => mapProduccionGestorHoyResponse(incompleteRow),
      /respuesta del servidor no contiene datos válidos/i
    );
  }),
  test('tolera propiedades adicionales y valores numéricos serializados como texto', () => {
    const [row] = mapProduccionGestorHoyResponse({
      ...createItem({ total: '12', ges4: '5' }),
      backendNuevoCampo: true,
    });

    assert.equal(row?.totalGestionesTelefonicas, 12);
    assert.equal(row?.contactos, 5);
    assert.equal(
      'backendNuevoCampo' in (row ?? {}),
      false
    );
  }),
]);
