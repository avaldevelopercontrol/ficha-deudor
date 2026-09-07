import assert from 'node:assert/strict';
import {
  assertApiBusinessSuccess,
  isSuccessfulApiBusinessResponse,
  normalizeApiCollectionResponse,
  unwrapApiCollectionResponse,
} from './apiResponse.utils';
import {
  defineSuite,
  test,
} from '../../test/testHarness';

const createEnvelope = (
  response: unknown,
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

export const suite = defineSuite(
  'apiCollectionResponse.utils',
  [
    test(
      'valida en conjunto statusCode y code para operaciones de negocio',
      () => {
        assert.equal(
          isSuccessfulApiBusinessResponse({
            code: '00',
            statusCode: 200,
          }),
          true
        );
        assert.equal(
          isSuccessfulApiBusinessResponse({
            code: '200',
            statusCode: 201,
          }),
          true
        );
        assert.equal(
          isSuccessfulApiBusinessResponse({
            code: '00',
            statusCode: 0,
          }),
          true
        );
        assert.equal(
          isSuccessfulApiBusinessResponse({
            code: '052',
            statusCode: 200,
          }),
          false
        );
        assert.equal(
          isSuccessfulApiBusinessResponse({
            code: '00',
            statusCode: 500,
          }),
          false
        );
      }
    ),
    test(
      'rechaza HTTP exitoso cuando el código de negocio informa error',
      () => {
        assert.throws(
          () =>
            assertApiBusinessSuccess(
              {
                code: '052',
                statusCode: 200,
                message:
                  'Detalle técnico',
                messageUser:
                  'No se pudo completar la operación.',
              },
              'Error de fallback'
            ),
          /No se pudo completar la operación\./
        );
      }
    ),
    test('normaliza arreglos objetos únicos y respuestas vacías', () => {
      const record = { id: 7 };

      assert.deepEqual(
        normalizeApiCollectionResponse<typeof record>(
          [record],
          'Error consultando colección'
        ),
        [record]
      );

      assert.deepEqual(
        normalizeApiCollectionResponse<typeof record>(
          record,
          'Error consultando colección'
        ),
        [record]
      );

      assert.deepEqual(
        normalizeApiCollectionResponse<typeof record>(
          null,
          'Error consultando colección'
        ),
        []
      );
    }),
    test('rechaza respuestas primitivas que incumplen el contrato', () => {
      assert.throws(
        () =>
          normalizeApiCollectionResponse(
            'respuesta inválida',
            'Error consultando colección'
          ),
        /respuesta del servidor no contiene datos válidos/i
      );
    }),
    test('acepta cualquier estado 2xx al desenvolver colecciones', () => {
      assert.deepEqual(
        unwrapApiCollectionResponse<{ id: number }>(
          createEnvelope(
            { id: 9 },
            { statusCode: 201 }
          ),
          'Error consultando colección'
        ),
        [{ id: 9 }]
      );
    }),
    test('mantiene la prioridad de mensajes cuando la API informa error', () => {
      assert.throws(
        () =>
          unwrapApiCollectionResponse(
            createEnvelope([], {
              statusCode: 422,
              message: 'Detalle técnico',
              messageUser: 'Mensaje para el usuario',
            }),
            'Error consultando colección'
          ),
        /Mensaje para el usuario/
      );
    }),
  ]
);
