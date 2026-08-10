import assert from 'node:assert/strict';
import {
  assertApiSuccess,
  getApiErrorMessage,
  isSuccessfulStatusCode,
  unwrapApiArrayResponse,
  unwrapApiObjectResponse,
  unwrapApiResponse,
} from './apiResponse.utils';
import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

const createEnvelope = <T>(
  response: T,
  overrides: Partial<{
    statusCode: unknown;
    message: unknown;
    messageUser: unknown;
  }> = {}
) => ({
  statusCode: 200,
  message: '',
  messageUser: '',
  response,
  ...overrides,
});

export const suite = defineSuite('apiResponse.utils', [
  test('acepta cualquier código HTTP 2xx entero', () => {
    assert.equal(isSuccessfulStatusCode(200), true);
    assert.equal(isSuccessfulStatusCode(201), true);
    assert.equal(isSuccessfulStatusCode(204), true);
    assert.equal(isSuccessfulStatusCode(299), true);
  }),
  test('rechaza códigos fuera de 2xx o con tipo inválido', () => {
    assert.equal(isSuccessfulStatusCode(199), false);
    assert.equal(isSuccessfulStatusCode(300), false);
    assert.equal(isSuccessfulStatusCode('200'), false);
    assert.equal(isSuccessfulStatusCode(200.5), false);
  }),
  test('prioriza el mensaje dirigido al usuario', () => {
    assert.equal(
      getApiErrorMessage(
        {
          message: 'Detalle técnico',
          messageUser: ' Mensaje visible ',
        },
        'Mensaje alternativo'
      ),
      'Mensaje visible'
    );
  }),
  test('usa el mensaje técnico y luego el fallback', () => {
    assert.equal(
      getApiErrorMessage(
        {
          message: ' Detalle técnico ',
          messageUser: ' ',
        },
        'Mensaje alternativo'
      ),
      'Detalle técnico'
    );

    assert.equal(
      getApiErrorMessage(
        {
          message: null,
          messageUser: undefined,
        },
        'Mensaje alternativo'
      ),
      'Mensaje alternativo'
    );
  }),
  test('lanza un error uniforme cuando el estado no es exitoso', () => {
    assert.throws(
      () =>
        assertApiSuccess(
          createEnvelope([], {
            statusCode: 400,
            messageUser: 'Solicitud inválida',
          }),
          'Error consultando datos'
        ),
      /Solicitud inválida/
    );
  }),
  test('desenvuelve respuestas simples no nulas', () => {
    const response = { id: 10, nombre: 'Dato' };

    assert.equal(
      unwrapApiResponse(
        createEnvelope(response, { statusCode: 201 }),
        'Error consultando datos'
      ),
      response
    );
  }),
  test('valida respuestas de arreglo sin convertir errores en listas vacías', () => {
    assert.deepEqual(
      unwrapApiArrayResponse<number>(
        createEnvelope([1, 2, 3]),
        'Error consultando lista'
      ),
      [1, 2, 3]
    );

    assert.throws(
      () =>
        unwrapApiArrayResponse<number>(
          createEnvelope({ items: [] }),
          'Error consultando lista'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );
  }),
  test('valida respuestas de objeto y rechaza nulos o arreglos', () => {
    assert.deepEqual(
      unwrapApiObjectResponse<{ id: number }>(
        createEnvelope({ id: 7 }),
        'Error consultando detalle'
      ),
      { id: 7 }
    );

    assert.throws(
      () =>
        unwrapApiObjectResponse<{ id: number }>(
          createEnvelope(null),
          'Error consultando detalle'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );

    assert.throws(
      () =>
        unwrapApiObjectResponse<{ id: number }>(
          createEnvelope([]),
          'Error consultando detalle'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );
  }),
]);
