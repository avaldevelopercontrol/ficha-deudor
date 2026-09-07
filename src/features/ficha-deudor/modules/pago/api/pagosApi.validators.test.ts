import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { isPagoApi } from './pagosApi.validators';

const validPago = {
  nro: 1,
  codigoCliente: 'C-01',
  nroDocumento: 'F001-10',
  fechaPago: '2026-08-28',
  montoPago: 120.5,
  moneda: 'PEN',
  zona: 'LIMA',
  notaCredito: '',
  marca: 'PAGADO',
};

export const suite = defineSuite('pagosApi.validators', [
  test('acepta un pago con contrato válido', () => {
    assert.equal(isPagoApi(validPago), true);
  }),
  test('rechaza monto o número con tipos incompatibles', () => {
    assert.equal(isPagoApi({ ...validPago, montoPago: '120.5' }), false);
    assert.equal(isPagoApi({ ...validPago, nro: 1.5 }), false);
  }),
]);
