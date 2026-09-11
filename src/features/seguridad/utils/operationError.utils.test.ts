import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  resolveOperationErrorMessage,
} from './operationError.utils';

export const suite = defineSuite(
  'operationError.utils',
  [
    test(
      'prioriza el mensaje real de Error y elimina espacios externos',
      () => {
        assert.equal(
          resolveOperationErrorMessage(
            new Error('  Falló la operación  '),
            'Mensaje alternativo'
          ),
          'Falló la operación'
        );
      }
    ),
    test(
      'usa el fallback para valores desconocidos o errores sin mensaje',
      () => {
        assert.equal(
          resolveOperationErrorMessage(
            { code: 'UNKNOWN' },
            'Mensaje alternativo'
          ),
          'Mensaje alternativo'
        );
        assert.equal(
          resolveOperationErrorMessage(
            new Error('   '),
            'Mensaje alternativo'
          ),
          'Mensaje alternativo'
        );
      }
    ),
  ]
);
