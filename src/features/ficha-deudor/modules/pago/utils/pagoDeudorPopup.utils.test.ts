import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { formatPagoPopupMonto } from './pagoDeudorPopup.utils';

export const suite = defineSuite('pagoDeudorPopup.utils', [
  test('formatea soles con dos decimales', () => {
    const result = formatPagoPopupMonto(1234.5, 'PEN');
    assert.match(result, /^S\/\s/);
    assert.match(result, /1[.,]234[.,]50|1\s234[.,]50/);
  }),
  test('formatea dólares con su símbolo', () => {
    const result = formatPagoPopupMonto(10, 'USD');
    assert.match(result, /^\$\s/);
    assert.match(result, /10[.,]00/);
  }),
  test('mantiene formato numérico cuando la moneda es desconocida', () => {
    const result = formatPagoPopupMonto(42, 'EUR');
    assert.match(result.trim(), /^42[.,]00$/);
  }),
]);
