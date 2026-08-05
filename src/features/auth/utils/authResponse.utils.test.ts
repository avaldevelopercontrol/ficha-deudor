import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { ApiError } from '@shared/api/apiClient';
import {
  buildLoginCancelledResponse,
  buildLoginErrorResponse,
  getLoginRequestErrorMessage,
} from './authResponse.utils';

export const suite = defineSuite('authResponse.utils', [
  test('construye una respuesta de login fallida uniforme', () => {
    assert.deepEqual(buildLoginErrorResponse('Credenciales inválidas'), {
      success: false,
      message: 'Credenciales inválidas',
      usuario: null,
    });
  }),

  test('distingue una autenticación cancelada de un error de credenciales', () => {
    assert.deepEqual(buildLoginCancelledResponse(), {
      success: false,
      message: 'La autenticación fue cancelada.',
      usuario: null,
      cancelled: true,
    });
  }),
  test('prioriza el mensaje dirigido al usuario en errores HTTP', () => {
    const error = new ApiError('Detalle técnico', 503, {
      message: 'Detalle técnico',
      messageUser: 'Servicio no disponible',
    });

    assert.equal(
      getLoginRequestErrorMessage(error),
      'Servicio no disponible'
    );
  }),
  test('mantiene errores normales y un fallback para valores desconocidos', () => {
    assert.equal(
      getLoginRequestErrorMessage(new Error('Sin conexión')),
      'Sin conexión'
    );
    assert.equal(
      getLoginRequestErrorMessage(null),
      'Error al iniciar sesión.'
    );
  }),
]);
