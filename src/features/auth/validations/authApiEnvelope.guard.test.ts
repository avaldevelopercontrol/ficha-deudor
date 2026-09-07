import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import {
  parseAuthApiEnvelope,
  unwrapAuthApiArrayResponse,
} from './authApiEnvelope.guard';

const INVALID_RESPONSE = 'Respuesta inválida.';
const LOAD_ERROR = 'No se pudo cargar.';

export const suite = defineSuite('authApiEnvelope.guard', [
  test('valida el sobre mínimo y conserva response como unknown', () => {
    const response = { value: 1 };

    assert.deepEqual(
      parseAuthApiEnvelope(
        {
          code: '00',
          statusCode: 200,
          message: 'OK',
          response,
          ignored: 'campo adicional',
        },
        INVALID_RESPONSE
      ),
      {
        code: '00',
        statusCode: 200,
        message: 'OK',
        messageUser: undefined,
        response,
      }
    );
  }),
  test('acepta response null porque los códigos especiales de login lo utilizan', () => {
    assert.equal(
      parseAuthApiEnvelope(
        {
          code: '092',
          statusCode: 400,
          response: null,
        },
        INVALID_RESPONSE
      ).response,
      null
    );
  }),
  test('rechaza valores que no son sobres y propiedades obligatorias ausentes', () => {
    for (const response of [
      null,
      [],
      'respuesta',
      {},
      { code: '00', statusCode: 200 },
      { code: '00', response: [] },
    ]) {
      assert.throws(
        () => parseAuthApiEnvelope(response, INVALID_RESPONSE),
        /Respuesta inválida/
      );
    }
  }),
  test('rechaza código vacío y statusCode con tipos o valores no enteros', () => {
    for (const response of [
      { code: '', statusCode: 200, response: [] },
      { code: '   ', statusCode: 200, response: [] },
      { code: '00', statusCode: '200', response: [] },
      { code: '00', statusCode: 200.5, response: [] },
    ]) {
      assert.throws(
        () => parseAuthApiEnvelope(response, INVALID_RESPONSE),
        /Respuesta inválida/
      );
    }
  }),
  test('desenvuelve arreglos con los códigos de éxito 00 y 200', () => {
    for (const code of ['00', '200']) {
      assert.deepEqual(
        unwrapAuthApiArrayResponse(
          {
            code,
            statusCode: 204,
            response: [{ id: 1 }],
          },
          INVALID_RESPONSE,
          LOAD_ERROR
        ),
        [{ id: 1 }]
      );
    }
  }),
  test('rechaza errores de aplicación y respuestas exitosas que no contienen un arreglo', () => {
    assert.throws(
      () =>
        unwrapAuthApiArrayResponse(
          {
            code: '01',
            statusCode: 200,
            message: 'Detalle técnico',
            messageUser: 'Mensaje para usuario',
            response: [],
          },
          INVALID_RESPONSE,
          LOAD_ERROR
        ),
      /Mensaje para usuario/
    );

    assert.throws(
      () =>
        unwrapAuthApiArrayResponse(
          {
            code: '00',
            statusCode: 200,
            response: null,
          },
          INVALID_RESPONSE,
          LOAD_ERROR
        ),
      /Respuesta inválida/
    );
  }),
]);
