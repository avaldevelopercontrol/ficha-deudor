import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  parseProduccionApiEnvelope,
} from './produccionOnlineApi.contract';

export const suite = defineSuite(
  'produccionOnlineApi.contract',
  [
    test(
      'acepta el contrato mínimo requerido por Producción online',
      () => {
        const response: unknown[] = [];

        assert.deepEqual(
          parseProduccionApiEnvelope(
            {
              code: '00',
              statusCode: 200,
              message: 'OK',
              messageUser: 'OK',
              response,
              totalRecords: 10,
            },
            'No se pudo cargar.'
          ),
          {
            code: '00',
            statusCode: 200,
            message: 'OK',
            messageUser: 'OK',
            response,
          }
        );
      }
    ),
    test(
      'rechaza valores raíz que no son objetos',
      () => {
        assert.throws(
          () =>
            parseProduccionApiEnvelope(
              null,
              'No se pudo cargar.'
            ),
          /respuesta del servidor no contiene datos válidos/i
        );
      }
    ),
    test(
      'rechaza envelopes sin code, statusCode o response',
      () => {
        for (const payload of [
          {
            statusCode: 200,
            response: [],
          },
          {
            code: '00',
            response: [],
          },
          {
            code: '00',
            statusCode: 200,
          },
        ]) {
          assert.throws(
            () =>
              parseProduccionApiEnvelope(
                payload,
                'No se pudo cargar.'
              ),
            /respuesta del servidor no contiene datos válidos/i
          );
        }
      }
    ),
    test(
      'rechaza tipos inválidos en los campos de estado',
      () => {
        assert.throws(
          () =>
            parseProduccionApiEnvelope(
              {
                code: 0,
                statusCode: '200',
                response: [],
              },
              'No se pudo cargar.'
            ),
          /respuesta del servidor no contiene datos válidos/i
        );
      }
    ),
  ]
);
