import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  fetchProduccionGestorHoy,
} from './produccionGestorHoyApi';

export const suite = defineSuite(
  'produccionGestorHoyApi',
  [
    test('propaga la señal y envía identificadores normalizados', async () => {
      const originalFetch = globalThis.fetch;
      let capturedUrl = '';
      let capturedSignal:
        AbortSignal | null | undefined;

      globalThis.fetch = async (input, init) => {
        capturedUrl = String(input);
        capturedSignal = init?.signal;

        return new Response(
          JSON.stringify({
            code: 'OK',
            message: '',
            messageUser: '',
            statusCode: 200,
            pageNumber: 1,
            pageSize: 100,
            totalRecords: 0,
            totalPages: 1,
            response: [],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      };

      try {
        const controller = new AbortController();

        await fetchProduccionGestorHoy(
          ' 25 ',
          ' 70 ',
          controller.signal
        );

        assert.equal(capturedSignal, controller.signal);
        assert.match(capturedUrl, /nId_Cliente=25/);
        assert.match(capturedUrl, /nId_Usuario=70/);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }),
    test('rechaza identificadores inválidos antes de ejecutar fetch', async () => {
      const originalFetch = globalThis.fetch;
      let fetchCalls = 0;

      globalThis.fetch = async () => {
        fetchCalls += 1;
        throw new Error('No debería ejecutarse');
      };

      try {
        await assert.rejects(
          () => fetchProduccionGestorHoy('0', '70'),
          /cliente y el usuario necesarios/i
        );
        await assert.rejects(
          () => fetchProduccionGestorHoy('25', 'abc'),
          /cliente y el usuario necesarios/i
        );
        assert.equal(fetchCalls, 0);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }),
  ]
);
