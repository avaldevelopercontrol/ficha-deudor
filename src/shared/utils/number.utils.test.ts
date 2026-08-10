import assert from 'node:assert/strict';
import { defineSuite, test } from '../../test/testHarness';
import {
  isPositiveIntegerValue,
  toNullableNumber,
  toNumberOrZero,
  toOptionalIdOrZero,
  toOptionalNumber,
  toRequiredId,
  toRequiredNumber,
} from './number.utils';

export const suite = defineSuite('number.utils', [
  test('convierte números válidos sin alterar su valor', () => {
    assert.equal(toOptionalNumber(' 12 '), 12);
    assert.equal(toOptionalNumber(4.5), 4.5);
    assert.equal(toNullableNumber('8'), 8);
  }),
  test('diferencia valores opcionales, nulos y cero contractual', () => {
    assert.equal(toOptionalNumber(''), undefined);
    assert.equal(toNullableNumber('texto'), null);
    assert.equal(toNumberOrZero(undefined), 0);
    assert.equal(toNumberOrZero('texto'), 0);
  }),
  test('exige un número finito cuando el campo es obligatorio', () => {
    assert.equal(toRequiredNumber('3.5', 'monto'), 3.5);
    assert.throws(
      () => toRequiredNumber('invalido', 'monto'),
      /monto debe contener un número válido/
    );
  }),
  test('acepta únicamente identificadores enteros positivos', () => {
    assert.equal(toRequiredId('15', 'id'), 15);
    assert.equal(isPositiveIntegerValue('15'), true);
    assert.equal(isPositiveIntegerValue(2), true);
    assert.equal(toOptionalIdOrZero('', 'idOpcional'), 0);
    assert.equal(toOptionalIdOrZero('0', 'idOpcional'), 0);
    assert.equal(toOptionalIdOrZero('9', 'idOpcional'), 9);
  }),
  test('rechaza identificadores vacíos, cero, negativos, decimales o texto', () => {
    for (const value of ['', '0', 0, -1, '1.5', '1e3', '0x10', 'abc']) {
      assert.equal(isPositiveIntegerValue(value), false);
      assert.throws(
        () => toRequiredId(value, 'idCliente'),
        /idCliente/
      );
    }

    assert.throws(
      () => toOptionalIdOrZero('abc', 'idOpcional'),
      /idOpcional/
    );
  }),
]);
