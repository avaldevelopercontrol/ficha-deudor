import assert from 'node:assert/strict';

import {
  ApiError,
} from '@shared/api/apiClient';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  resolveSeguridadApiError,
} from './seguridadApiError';

export const suite = defineSuite(
  'seguridadApiError',
  [
    test(
      'prioriza messageUser sobre el mensaje técnico del ApiError',
      () => {
        const resolved = resolveSeguridadApiError(
          new ApiError(
            'Bad Request',
            400,
            {
              message: 'Error interno',
              messageUser: 'Mensaje para el usuario',
            }
          ),
          'Error de respaldo'
        );

        assert.equal(
          resolved.message,
          'Mensaje para el usuario'
        );
      }
    ),
    test(
      'conserva AbortError sin envolverlo',
      () => {
        const abortError = new Error('cancelado');
        abortError.name = 'AbortError';

        const resolved = resolveSeguridadApiError(
          abortError,
          'Error de respaldo'
        );

        assert.equal(resolved, abortError);
        assert.equal(resolved.name, 'AbortError');
      }
    ),
    test(
      'conserva errores con mensaje y usa fallback para valores desconocidos',
      () => {
        const original = new Error('Error específico');

        assert.equal(
          resolveSeguridadApiError(
            original,
            'Error de respaldo'
          ),
          original
        );
        assert.equal(
          resolveSeguridadApiError(
            null,
            ' Error de respaldo '
          ).message,
          'Error de respaldo'
        );
      }
    ),
  ]
);
