import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../test/testHarness';
import { hasRequiredValues } from './requiredValues.utils';

export const suite = defineSuite('requiredValues.utils', [
  test('acepta textos, números y cero cuando contienen un valor', () => {
    assert.equal(hasRequiredValues('cliente', 95, 0), true);
  }),

  test('rechaza valores nulos, indefinidos o textos en blanco', () => {
    assert.equal(hasRequiredValues(null), false);
    assert.equal(hasRequiredValues(undefined), false);
    assert.equal(hasRequiredValues('   '), false);
  }),

  test('exige que todos los valores requeridos estén presentes', () => {
    assert.equal(hasRequiredValues('95', '10', '500'), true);
    assert.equal(hasRequiredValues('95', '', '500'), false);
  }),
]);
