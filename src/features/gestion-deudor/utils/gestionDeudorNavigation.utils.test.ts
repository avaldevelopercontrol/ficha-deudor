import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { createDeudorGestion } from '../../../test/factories/gestionDeudor.factory';
import { buildFichaDeudorParams } from './gestionDeudorNavigation.utils';

export const suite = defineSuite('gestionDeudorNavigation.utils', [
  test('construye todos los parámetros requeridos por la ficha', () => {
    const params = buildFichaDeudorParams({
      row: createDeudorGestion(),
      idCliente: '99',
      idUsuario: '50',
      fechaInicioGestion: new Date('2026-08-04T14:20:30.000Z'),
    });

    assert.deepEqual(params, {
      id_cliente: '10',
      id_cartera: '30',
      id_deudor: '301',
      id_contrato: '20',
      id_usuario: '50',
      fecha_inicio_gestion: '2026-08-04T14:20:30.000Z',
    });
  }),
  test('usa el cliente autenticado cuando el registro no incluye cliente', () => {
    const params = buildFichaDeudorParams({
      row: createDeudorGestion({ nId_Cliente: 0 }),
      idCliente: '99',
      idUsuario: '50',
      fechaInicioGestion: new Date('2026-08-04T14:20:30.000Z'),
    });

    assert.equal(params.id_cliente, '99');
  }),
  test('rechaza identificadores inválidos antes de abrir la ficha', () => {
    assert.throws(
      () =>
        buildFichaDeudorParams({
          row: createDeudorGestion({ nId_Cartera: 0 }),
          idCliente: '99',
          idUsuario: '50',
        }),
      /nId_Cartera/
    );

    assert.throws(
      () =>
        buildFichaDeudorParams({
          row: createDeudorGestion({ nId_Cliente: 0 }),
          idCliente: 'abc',
          idUsuario: '50',
        }),
      /idCliente/
    );

    assert.throws(
      () =>
        buildFichaDeudorParams({
          row: createDeudorGestion(),
          idCliente: '99',
          idUsuario: '0',
        }),
      /idUsuario/
    );
  }),
  test('no altera los identificadores válidos del registro seleccionado', () => {
    const params = buildFichaDeudorParams({
      row: createDeudorGestion({
        nId_Cartera: 88,
        nId_PersDeudor: 77,
        nId_Contrato: 66,
      }),
      idCliente: '99',
      idUsuario: '50',
      fechaInicioGestion: new Date('2026-08-04T14:20:30.000Z'),
    });

    assert.equal(params.id_cartera, '88');
    assert.equal(params.id_deudor, '77');
    assert.equal(params.id_contrato, '66');
  }),
]);
