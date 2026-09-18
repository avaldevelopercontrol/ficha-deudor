import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  fetchProduccionResumen,
} from './produccionOnlineApi';
import {
  PRODUCCION_ONLINE_DEFAULT_FILTERS,
} from '../constants/produccionOnline.constants';

const successEnvelope = (
  response: unknown
) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  pageNumber: 0,
  pageSize: 0,
  totalRecords: 0,
  totalPages: 0,
  response,
});

const withMockedFetch = async (
  payload: unknown,
  run: () => Promise<void>
): Promise<void> => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
};

export const suite = defineSuite(
  'produccionOnlineApi',
  [
    test(
      'envía los cuatro filtros con los valores predeterminados definidos para el popup',
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
            JSON.stringify(
              successEnvelope([])
            ),
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

          await fetchProduccionResumen(
            {
              ...PRODUCCION_ONLINE_DEFAULT_FILTERS,
            },
            controller.signal
          );

          const requestUrl = new URL(
            capturedUrl
          );

          assert.equal(
            requestUrl.pathname,
            '/v1/Produccion/GetProduccionResumen'
          );
          assert.equal(
            requestUrl.searchParams.get(
              'nId_Cliente'
            ),
            '0'
          );
          assert.equal(
            requestUrl.searchParams.get(
              'nId_Perfil'
            ),
            '2'
          );
          assert.equal(
            requestUrl.searchParams.get(
              'nId_Ubigeo'
            ),
            '0'
          );
          assert.equal(
            requestUrl.searchParams.get(
              'nId_TipoLlamada'
            ),
            '-1'
          );
          assert.equal(
            capturedSignal,
            controller.signal
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
    test(
      'rechaza una respuesta HTTP 200 cuyo envelope es inválido',
      async () => {
        await withMockedFetch(
          {
            code: '00',
            statusCode: 200,
          },
          async () => {
            await assert.rejects(
              fetchProduccionResumen(
                PRODUCCION_ONLINE_DEFAULT_FILTERS
              ),
              /respuesta del servidor no contiene datos válidos/i
            );
          }
        );
      }
    ),
    test(
      'conserva el mensaje de negocio entregado por el backend',
      async () => {
        await withMockedFetch(
          {
            code: '99',
            statusCode: 200,
            message: 'Error técnico',
            messageUser:
              'No hay producción disponible.',
            response: [],
          },
          async () => {
            await assert.rejects(
              fetchProduccionResumen(
                PRODUCCION_ONLINE_DEFAULT_FILTERS
              ),
              /No hay producción disponible\./
            );
          }
        );
      }
    ),
  ]
);
