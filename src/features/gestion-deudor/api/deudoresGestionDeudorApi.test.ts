import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../../test/testHarness';
import {
  createDeudorGestionApi,
} from '../../../test/factories/gestionDeudor.factory';
import {
  fetchDeudoresGestionDeudor,
} from './deudoresGestionDeudorApi';

export const suite = defineSuite(
  'deudoresGestionDeudorApi',
  [
    test(
      'propaga AbortSignal y conserva los parámetros del contrato HTTP',
      async () => {
        const originalFetch = globalThis.fetch;
        let capturedUrl = '';
        let capturedSignal:
          AbortSignal | null | undefined;

        globalThis.fetch = async (
          input,
          init
        ) => {
          capturedUrl = String(input);
          capturedSignal = init?.signal;

          return new Response(
            JSON.stringify({
              code: 'OK',
              message: '',
              messageUser: '',
              statusCode: 200,
              pageNumber: 1,
              pageSize: 1000,
              totalRecords: 1,
              totalPages: 1,
              response: [
                createDeudorGestionApi({
                  nId_PersDeudor: 501,
                }),
              ],
            }),
            {
              status: 200,
              headers: {
                'Content-Type':
                  'application/json',
              },
            }
          );
        };

        try {
          const controller =
            new AbortController();
          const rows =
            await fetchDeudoresGestionDeudor(
              {
                nIdCliente: '25',
                busqueda: 'D12345678',
                pageNumber: 1,
                pageSize: 1000,
              },
              controller.signal
            );

          assert.equal(
            capturedSignal,
            controller.signal
          );
          assert.match(
            capturedUrl,
            /nId_Cliente=25/
          );
          assert.match(
            capturedUrl,
            /busqueda=D12345678/
          );
          assert.match(
            capturedUrl,
            /PageNumber=1/
          );
          assert.match(
            capturedUrl,
            /PageSize=1000/
          );
          assert.equal(
            rows[0]?.nId_PersDeudor,
            501
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza un cliente inválido antes de ejecutar fetch',
      async () => {
        const originalFetch = globalThis.fetch;
        let fetchCalls = 0;

        globalThis.fetch = async () => {
          fetchCalls += 1;
          throw new Error('No debería ejecutarse');
        };

        try {
          await assert.rejects(
            () =>
              fetchDeudoresGestionDeudor({
                nIdCliente: 'abc',
                busqueda: 'D12345678',
              }),
            /nId_Cliente/
          );
          assert.equal(fetchCalls, 0);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
