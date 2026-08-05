import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { validateGestionDeudorSearch } from './validations';

export const suite = defineSuite('validateGestionDeudorSearch', [
  test('normaliza espacios y construye la búsqueda por RUC', () => {
    const result = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'R',
      valorBusqueda: ' 20 123 456 789 ',
    });

    assert.equal(result.isValid, true);
    assert.equal(result.valorNormalizado, '20123456789');
    assert.equal(result.busqueda, 'R20123456789');
  }),
  test('rechaza una búsqueda sin cliente seleccionado', () => {
    const result = validateGestionDeudorSearch({
      idCliente: '',
      tipoBusqueda: 'D',
      valorBusqueda: '12345678',
    });

    assert.equal(result.isValid, false);
    assert.match(result.message ?? '', /cliente seleccionado/i);
  }),
  test('rechaza identificadores de cliente inválidos aunque no estén vacíos', () => {
    for (const idCliente of ['0', '-1', '1.5', '1e3', 'abc']) {
      const result = validateGestionDeudorSearch({
        idCliente,
        tipoBusqueda: 'D',
        valorBusqueda: '12345678',
      });

      assert.equal(result.isValid, false);
      assert.match(
        result.message ?? '',
        /identificador del cliente seleccionado no es válido/i
      );
    }
  }),
  test('rechaza valores vacíos o con caracteres no numéricos', () => {
    const empty = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'D',
      valorBusqueda: '   ',
    });
    const invalid = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'D',
      valorBusqueda: '1234A678',
    });

    assert.equal(empty.isValid, false);
    assert.equal(invalid.isValid, false);
    assert.match(invalid.message ?? '', /solo debe contener números/i);
  }),
  test('exige ocho dígitos para DNI', () => {
    const invalid = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'D',
      valorBusqueda: '1234567',
    });
    const valid = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'D',
      valorBusqueda: '12345678',
    });

    assert.equal(invalid.isValid, false);
    assert.equal(valid.isValid, true);
    assert.equal(valid.busqueda, 'D12345678');
  }),
  test('exige once dígitos para RUC', () => {
    const invalid = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'R',
      valorBusqueda: '2012345678',
    });
    const valid = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'R',
      valorBusqueda: '20123456789',
    });

    assert.equal(invalid.isValid, false);
    assert.equal(valid.isValid, true);
  }),
  test('acepta teléfonos entre seis y quince dígitos', () => {
    const tooShort = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'F',
      valorBusqueda: '12345',
    });
    const minimum = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'F',
      valorBusqueda: '123456',
    });
    const maximum = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'F',
      valorBusqueda: '123456789012345',
    });
    const tooLong = validateGestionDeudorSearch({
      idCliente: '10',
      tipoBusqueda: 'F',
      valorBusqueda: '1234567890123456',
    });

    assert.equal(tooShort.isValid, false);
    assert.equal(minimum.isValid, true);
    assert.equal(maximum.isValid, true);
    assert.equal(tooLong.isValid, false);
  }),
]);
