import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  createDeudorGestionApi,
} from '../../../../../test/factories/gestionDeudor.factory';
import {
  fetchDeudoresGestionDeudor,
} from './deudoresGestionDeudorApi';

interface PageResponseOptions {
  pageNumber?: number;
  pageSize?: number;
  totalRecords?: number;
  totalPages?: number;
  response?: unknown;
}

const createPageResponse = ({
  pageNumber = 1,
  pageSize = 1000,
  totalRecords = 1,
  totalPages = 1,
  response = [createDeudorGestionApi()],
}: PageResponseOptions = {}): Response => {
  return new Response(
    JSON.stringify({
      code: 'OK',
      message: '',
      messageUser: '',
      statusCode: 200,
      pageNumber,
      pageSize,
      totalRecords,
      totalPages,
      response,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

const getRequestedPageNumber = (
  input: RequestInfo | URL
): number => {
  const url = new URL(
    String(input),
    'http://localhost'
  );

  return Number(
    url.searchParams.get('PageNumber')
  );
};

const createRows = (
  firstId: number,
  count: number
) => {
  return Array.from(
    { length: count },
    (_, index) =>
      createDeudorGestionApi({
        nId_PersDeudor: firstId + index,
      })
  );
};

export const suite = defineSuite(
  'deudoresGestionDeudorApi',
  [
    test(
      'propaga AbortSignal y usa la primera página/tamaño de lote internos',
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

          return createPageResponse({
            response: [
              createDeudorGestionApi({
                nId_PersDeudor: 501,
              }),
            ],
          });
        };

        try {
          const controller =
            new AbortController();
          const rows =
            await fetchDeudoresGestionDeudor(
              {
                idCliente: '25',
                busqueda: 'D12345678',
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
            rows[0]?.idDeudor,
            501
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'recupera todas las páginas, conserva su orden y propaga el mismo AbortSignal',
      async () => {
        const originalFetch = globalThis.fetch;
        const controller = new AbortController();
        const requestedPages: number[] = [];
        const capturedSignals: Array<
          AbortSignal | null | undefined
        > = [];

        globalThis.fetch = async (
          input,
          init
        ) => {
          const pageNumber =
            getRequestedPageNumber(input);
          requestedPages.push(pageNumber);
          capturedSignals.push(init?.signal);

          if (pageNumber === 2) {
            await new Promise((resolve) =>
              setTimeout(resolve, 10)
            );
          }

          const response =
            pageNumber === 1
              ? createRows(1, 1000)
              : pageNumber === 2
                ? createRows(1001, 1000)
                : createRows(2001, 1);

          return createPageResponse({
            pageNumber,
            totalRecords: 2001,
            totalPages: 3,
            response,
          });
        };

        try {
          const rows =
            await fetchDeudoresGestionDeudor(
              {
                idCliente: '25',
                busqueda: 'F999999999',
              },
              controller.signal
            );

          assert.deepEqual(
            [...requestedPages].sort(
              (a, b) => a - b
            ),
            [1, 2, 3]
          );
          assert.equal(rows.length, 2001);
          assert.equal(rows[0]?.idDeudor, 1);
          assert.equal(
            rows[999]?.idDeudor,
            1000
          );
          assert.equal(
            rows[1000]?.idDeudor,
            1001
          );
          assert.equal(
            rows[2000]?.idDeudor,
            2001
          );
          assert.equal(
            capturedSignals.every(
              (signal) =>
                signal === controller.signal
            ),
            true
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'acepta una búsqueda sin resultados sin solicitar páginas adicionales',
      async () => {
        const originalFetch = globalThis.fetch;
        let fetchCalls = 0;

        globalThis.fetch = async () => {
          fetchCalls += 1;
          return createPageResponse({
            totalRecords: 0,
            totalPages: 0,
            response: [],
          });
        };

        try {
          const rows =
            await fetchDeudoresGestionDeudor({
              idCliente: '25',
              busqueda: 'D12345678',
            });

          assert.deepEqual(rows, []);
          assert.equal(fetchCalls, 1);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza metadata paginada inválida o distinta de la página solicitada',
      async () => {
        const originalFetch = globalThis.fetch;

        try {
          for (const response of [
            createPageResponse({
              pageNumber: 2,
            }),
            createPageResponse({
              pageSize: 999,
            }),
            createPageResponse({
              totalRecords: 1,
              totalPages: 0,
            }),
          ]) {
            globalThis.fetch = async () =>
              response.clone();

            await assert.rejects(
              () =>
                fetchDeudoresGestionDeudor({
                  idCliente: '25',
                  busqueda: 'D12345678',
                }),
              /respuesta del servidor no contiene datos válidos/i
            );
          }
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza cambios de metadata entre páginas para no combinar colecciones inconsistentes',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async (input) => {
          const pageNumber =
            getRequestedPageNumber(input);

          return createPageResponse({
            pageNumber,
            totalRecords:
              pageNumber === 1 ? 1001 : 1002,
            totalPages: 2,
            response:
              pageNumber === 1
                ? createRows(1, 1000)
                : createRows(1001, 1),
          });
        };

        try {
          await assert.rejects(
            () =>
              fetchDeudoresGestionDeudor({
                idCliente: '25',
                busqueda: 'F999999999',
              }),
            /respuesta del servidor no contiene datos válidos/i
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza cuando totalRecords no coincide con la colección completa obtenida',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async (input) => {
          const pageNumber =
            getRequestedPageNumber(input);

          return createPageResponse({
            pageNumber,
            totalRecords: 1001,
            totalPages: 2,
            response:
              pageNumber === 1
                ? createRows(1, 999)
                : createRows(1000, 1),
          });
        };

        try {
          await assert.rejects(
            () =>
              fetchDeudoresGestionDeudor({
                idCliente: '25',
                busqueda: 'F999999999',
              }),
            /respuesta del servidor no contiene datos válidos/i
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'propaga el error de negocio de cualquier página restante',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async (input) => {
          const pageNumber =
            getRequestedPageNumber(input);

          if (pageNumber === 2) {
            return new Response(
              JSON.stringify({
                statusCode: 500,
                messageUser:
                  'No se pudo consultar la página 2.',
              }),
              {
                status: 200,
                headers: {
                  'Content-Type':
                    'application/json',
                },
              }
            );
          }

          return createPageResponse({
            pageNumber,
            totalRecords: 1001,
            totalPages: 2,
            response: createRows(1, 1000),
          });
        };

        try {
          await assert.rejects(
            () =>
              fetchDeudoresGestionDeudor({
                idCliente: '25',
                busqueda: 'F999999999',
              }),
            /No se pudo consultar la página 2\./
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza un envelope HTTP 200 sin response',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              code: 'OK',
              message: '',
              messageUser: '',
              statusCode: 200,
              pageNumber: 1,
              pageSize: 1000,
              totalRecords: 1,
              totalPages: 1,
            }),
            {
              status: 200,
              headers: {
                'Content-Type':
                  'application/json',
              },
            }
          );

        try {
          await assert.rejects(
            () =>
              fetchDeudoresGestionDeudor({
                idCliente: '25',
                busqueda: 'D12345678',
              }),
            /respuesta del servidor no contiene datos válidos/i
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza filas primitivas recibidas desde el backend',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          createPageResponse({
            totalRecords: 2,
            response: [
              createDeudorGestionApi(),
              'fila-corrupta',
            ],
          });

        try {
          await assert.rejects(
            () =>
              fetchDeudoresGestionDeudor({
                idCliente: '25',
                busqueda: 'D12345678',
              }),
            /respuesta del servidor no contiene datos válidos/i
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'preserva el mensaje de error de negocio antes de validar paginación y response',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              statusCode: 500,
              messageUser:
                'No se pudo consultar la cartera.',
            }),
            {
              status: 200,
              headers: {
                'Content-Type':
                  'application/json',
              },
            }
          );

        try {
          await assert.rejects(
            () =>
              fetchDeudoresGestionDeudor({
                idCliente: '25',
                busqueda: 'D12345678',
              }),
            /No se pudo consultar la cartera\./
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
                idCliente: 'abc',
                busqueda: 'D12345678',
              }),
            /idCliente/
          );
          assert.equal(fetchCalls, 0);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
