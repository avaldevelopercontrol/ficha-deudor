import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import { createDeudorGestionApi } from '../../../../../test/factories/gestionDeudor.factory';
import {
  mapDeudorGestionDeudor,
  mapDeudoresGestionDeudorResponse,
} from './gestionDeudor.mapper';

export const suite = defineSuite('gestionDeudor.mapper', [
  test('normaliza textos y valores numéricos recibidos por la API', () => {
    const row = mapDeudorGestionDeudor(
      createDeudorGestionApi({
        nId_PersDeudor: '301',
        saldo: '900.25',
        deudor: null,
      })
    );

    assert.equal(row.idDeudor, 301);
    assert.equal(row.saldo, 900.25);
    assert.equal(row.deudor, '');
  }),
  test('mapea respuestas con múltiples registros', () => {
    const rows = mapDeudoresGestionDeudorResponse([
      createDeudorGestionApi({ nId_PersDeudor: 301 }),
      createDeudorGestionApi({ nId_PersDeudor: 302 }),
    ]);

    assert.deepEqual(
      rows.map((row) => row.idDeudor),
      [301, 302]
    );
  }),
  test('mantiene compatibilidad con una respuesta de objeto único', () => {
    const rows = mapDeudoresGestionDeudorResponse(
      createDeudorGestionApi({ nId_PersDeudor: 401 })
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.idDeudor, 401);
  }),
  test('convierte una respuesta nula en una colección vacía', () => {
    assert.deepEqual(
      mapDeudoresGestionDeudorResponse(null),
      []
    );
  }),
  test('mantiene cero únicamente para el cliente opcional del registro', () => {
    const row = mapDeudorGestionDeudor(
      createDeudorGestionApi({ nId_Cliente: 0 })
    );

    assert.equal(row.idCliente, 0);
  }),
  test('rechaza identificadores principales inválidos en lugar de convertirlos en cero', () => {
    for (const overrides of [
      { nId_PersDeudor: 0 },
      { nId_Contrato: -1 },
      { nId_Cartera: 'abc' },
      { nId_Cliente: 'abc' },
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
        importe: 'no-numérico',
        cantidadGestionCALL: Number.NaN,
      })
    );

    assert.equal(row.importe, 0);
    assert.equal(row.cantidadGestionCall, 0);
  }),
  test('rechaza filas primitivas y registros incompletos', () => {
    assert.throws(
      () => mapDeudoresGestionDeudorResponse([null]),
      /respuesta del servidor no contiene datos válidos/i
    );

    const incompleteRow = {
      ...createDeudorGestionApi(),
    };
    Reflect.deleteProperty(
      incompleteRow,
      'mejorStatus'
    );

    assert.throws(
      () => mapDeudoresGestionDeudorResponse(incompleteRow),
      /respuesta del servidor no contiene datos válidos/i
    );
  }),
  test('tolera propiedades adicionales sin incorporarlas al modelo', () => {
    const [row] = mapDeudoresGestionDeudorResponse({
      ...createDeudorGestionApi({ nId_PersDeudor: '777' }),
      backendNuevoCampo: 'valor',
    });

    assert.equal(row?.idDeudor, 777);
    assert.equal(
      'backendNuevoCampo' in (row ?? {}),
      false
    );
  }),
  test('no propaga nombres del contrato HTTP al modelo de dominio', () => {
    const row = mapDeudorGestionDeudor(
      createDeudorGestionApi({
        nId_PersDeudor: 901,
        nro: 7,
        zonaCampanna: 'NORTE',
      })
    );

    assert.equal(row.idDeudor, 901);
    assert.equal(row.numero, 7);
    assert.equal(row.zonaCampania, 'NORTE');
    assert.equal('nId_PersDeudor' in row, false);
    assert.equal('nro' in row, false);
    assert.equal('zonaCampanna' in row, false);
  }),
]);
