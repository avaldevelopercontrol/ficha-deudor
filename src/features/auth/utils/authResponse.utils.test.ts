import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { ApiError } from '@shared/api/apiClient';
import {
  buildExpiredPasswordChallenge,
  buildLoginCancelledResponse,
  buildLoginErrorResponse,
  getLoginRequestErrorMessage,
} from './authResponse.utils';

export const suite = defineSuite('authResponse.utils', [
  test('construye una respuesta de login fallida uniforme', () => {
    assert.deepEqual(buildLoginErrorResponse('Credenciales inválidas'), {
      success: false,
      code: 'CLIENT_ERROR',
      message: 'Credenciales inválidas',
      usuario: null,
    });
  }),

  test('construye el reto de clave expirada usando el login como nId_Usuario', () => {
    assert.deepEqual(
      buildExpiredPasswordChallenge(' 16149 ', 'Su clave ha expirado.'),
      {
        userId: '16149',
        message: 'Su clave ha expirado.',
      }
    );
  }),
  test('rechaza un login no numérico para el reto de clave expirada', () => {
    assert.equal(
      buildExpiredPasswordChallenge('cramirez', 'Su clave ha expirado.'),
      null
    );
  }),
  test('distingue una autenticación cancelada de un error de credenciales', () => {
    assert.deepEqual(buildLoginCancelledResponse(), {
      success: false,
      code: 'CANCELLED',
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
