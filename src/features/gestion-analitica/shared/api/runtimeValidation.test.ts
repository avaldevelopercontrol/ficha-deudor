import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import {
  expectRuntimeArray,
  expectRuntimeBoolean,
  expectRuntimeEnum,
  expectRuntimeFiniteNumber,
  expectRuntimeNonEmptyString,
  expectRuntimeNonNegativeInteger,
  expectRuntimePositiveInteger,
  expectRuntimeRecord,
  type RuntimeValidationFailure,
} from './runtimeValidation';

const fail: RuntimeValidationFailure = (
  path,
  expected
): never => {
  throw new Error(`${path}: ${expected}`);
};

const assertValidationFailure = (
  action: () => unknown,
  expectedMessage: RegExp
): void => {
  assert.throws(action, expectedMessage);
};

export const suite = defineSuite(
  'runtimeValidation',
  [
    test('acepta las primitivas runtime válidas sin transformarlas', () => {
      const record = { id: 1 };
      const array = [1, 'dos'];
      const allowed = new Set(['active', 'inactive']);

      assert.equal(
        expectRuntimeRecord(record, '$', fail),
        record
      );
      assert.equal(
        expectRuntimeArray(array, '$.items', fail),
        array
      );
      assert.equal(
        expectRuntimeNonEmptyString(
          ' valor ',
          '$.name',
          fail
        ),
        ' valor '
      );
      assert.equal(
        expectRuntimeBoolean(true, '$.enabled', fail),
        true
      );
      assert.equal(
        expectRuntimeNonNegativeInteger(
          0,
          '$.offset',
          fail
        ),
        0
      );
      assert.equal(
        expectRuntimePositiveInteger(1, '$.id', fail),
        1
      );
      assert.equal(
        expectRuntimeFiniteNumber(1.5, '$.amount', fail),
        1.5
      );
      assert.equal(
        expectRuntimeEnum<'active' | 'inactive'>(
          'active',
          allowed,
          '$.status',
          fail
        ),
        'active'
      );
    }),
    test('rechaza objetos y colecciones con shapes incompatibles', () => {
      assertValidationFailure(
        () => expectRuntimeRecord([], '$', fail),
        /\$: un objeto/
      );
      assertValidationFailure(
        () => expectRuntimeArray({}, '$.items', fail),
        /\$\.items: un arreglo/
      );
    }),
    test('rechaza strings vacíos y tipos primitivos incorrectos', () => {
      assertValidationFailure(
        () =>
          expectRuntimeNonEmptyString(
            '   ',
            '$.name',
            fail
          ),
        /\$\.name: un texto no vacío/
      );
      assertValidationFailure(
        () => expectRuntimeBoolean(1, '$.enabled', fail),
        /\$\.enabled: un booleano/
      );
    }),
    test('rechaza enteros fuera de rango y números no finitos', () => {
      assertValidationFailure(
        () =>
          expectRuntimeNonNegativeInteger(
            -1,
            '$.offset',
            fail
          ),
        /\$\.offset: un entero no negativo/
      );
      assertValidationFailure(
        () =>
          expectRuntimePositiveInteger(
            0,
            '$.id',
            fail
          ),
        /\$\.id: un entero positivo/
      );
      assertValidationFailure(
        () =>
          expectRuntimePositiveInteger(
            Number.MAX_SAFE_INTEGER + 1,
            '$.id',
            fail
          ),
        /\$\.id: un entero positivo/
      );
      assertValidationFailure(
        () =>
          expectRuntimeFiniteNumber(
            Number.POSITIVE_INFINITY,
            '$.amount',
            fail
          ),
        /\$\.amount: un número finito/
      );
    }),
    test('rechaza enums fuera del conjunto permitido y conserva el path', () => {
      assertValidationFailure(
        () =>
          expectRuntimeEnum(
            'unknown',
            new Set(['active', 'inactive']),
            '$.status',
            fail
          ),
        /\$\.status: uno de: active, inactive/
      );
    }),
    test('permite personalizar la expectativa sin duplicar validación', () => {
      assertValidationFailure(
        () =>
          expectRuntimeRecord(
            null,
            '$.payload',
            fail,
            'payload JSON'
          ),
        /\$\.payload: payload JSON/
      );
    }),
  ]
);
