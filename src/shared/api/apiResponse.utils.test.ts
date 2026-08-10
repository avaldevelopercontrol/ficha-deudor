import assert from 'node:assert/strict';
import {
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
