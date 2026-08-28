import assert from 'node:assert/strict';
import {
  assertApiSuccess,
  getApiErrorMessage,
  isSuccessfulStatusCode,
  normalizeApiCollectionResponse,
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
    code: unknown;
    statusCode: unknown;
    message: unknown;
    messageUser: unknown;
    pageNumber: unknown;
    pageSize: unknown;
    totalRecords: unknown;
    totalPages: unknown;
  }> = {}
) => ({
  code: '00',
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
  test('acepta únicamente códigos de negocio exitosos conocidos', () => {
    assert.doesNotThrow(() =>
      assertApiSuccess(
        createEnvelope([], { code: '00' }),
        'Error consultando datos'
      )
    );
    assert.doesNotThrow(() =>
      assertApiSuccess(
        createEnvelope([], { code: ' 200 ' }),
        'Error consultando datos'
      )
    );

    assert.throws(
      () =>
        assertApiSuccess(
          createEnvelope([], {
            code: '99',
            messageUser: 'Operación rechazada',
          }),
          'Error consultando datos'
        ),
      /Operación rechazada/
    );
  }),
  test('rechaza sobres incompletos o con tipos inválidos', () => {
    assert.throws(
      () =>
        assertApiSuccess(
          {
            statusCode: 200,
            message: '',
            messageUser: '',
            response: [],
          },
          'Error consultando datos'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );

    assert.throws(
      () =>
        assertApiSuccess(
          createEnvelope([], { code: 0 }),
          'Error consultando datos'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );

    assert.throws(
      () =>
        assertApiSuccess(
          createEnvelope([], { statusCode: '200' }),
          'Error consultando datos'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );

    assert.throws(
      () =>
        assertApiSuccess(
          createEnvelope([], { message: { error: true } }),
          'Error consultando datos'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );
  }),
  test('valida todos los metadatos de paginación cuando están presentes', () => {
    assert.doesNotThrow(() =>
      assertApiSuccess(
        createEnvelope([], {
          pageNumber: 0,
          pageSize: 20,
          totalRecords: 35,
          totalPages: 2,
        }),
        'Error consultando datos'
      )
    );

    assert.throws(
      () =>
        assertApiSuccess(
          createEnvelope([], {
            pageNumber: 1,
            pageSize: 20,
            totalRecords: -1,
            totalPages: 0,
          }),
          'Error consultando datos'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );

    assert.throws(
      () =>
        assertApiSuccess(
          createEnvelope([], { pageNumber: 1 }),
          'Error consultando datos'
        ),
      /respuesta del servidor no contiene datos válidos/i
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

    assert.throws(
      () =>
        unwrapApiResponse(
          createEnvelope(undefined),
          'Error consultando datos'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );
  }),
  test('valida respuestas de arreglo sin convertir errores en listas vacías', () => {
    assert.deepEqual(
      unwrapApiArrayResponse<{ id: number }>(
        createEnvelope([{ id: 1 }, { id: 2 }]),
        'Error consultando lista'
      ),
      [{ id: 1 }, { id: 2 }]
    );

    assert.throws(
      () =>
        unwrapApiArrayResponse<{ id: number }>(
          createEnvelope({ items: [] }),
          'Error consultando lista'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );

    assert.throws(
      () =>
        unwrapApiArrayResponse<{ id: number }>(
          createEnvelope([{ id: 1 }, null]),
          'Error consultando lista'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );

    assert.throws(
      () =>
        unwrapApiArrayResponse<{ id: number }>(
          createEnvelope([1, 2]),
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
  test('normaliza colecciones solo cuando contienen registros válidos', () => {
    assert.deepEqual(
      normalizeApiCollectionResponse<{ id: number }>(
        { id: 8 },
        'Error consultando lista'
      ),
      [{ id: 8 }]
    );
    assert.deepEqual(
      normalizeApiCollectionResponse<{ id: number }>(
        null,
        'Error consultando lista'
      ),
      []
    );

    assert.throws(
      () =>
        normalizeApiCollectionResponse<{ id: number }>(
          [{ id: 1 }, 'inválido'],
          'Error consultando lista'
        ),
      /respuesta del servidor no contiene datos válidos/i
    );
  }),
]);
