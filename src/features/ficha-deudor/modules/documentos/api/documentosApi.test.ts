import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  fetchAllGestiones,
  fetchColumnas,
} from './documentosApi';

const createDocumento = (id: number) => ({
  nId_DocxCobrar: id,
  mejorStatus: 0,
  nId_Moneda: 1,
  bEstado: 1,
  nZona: 'LIMA',
  bSelected: false,
  nId_Estrategia: 1,
  nId_Cartera: 156,
});

const createPaginatedResponse = (
  pageNumber: number,
  totalPages: number,
  ids: number[]
) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  pageNumber,
  pageSize: 2000,
  totalRecords: totalPages * ids.length,
  totalPages,
  response: ids.map(createDocumento),
});

const getPageNumberFromRequest = (
  input: string | URL | Request
): number => {
  const rawUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  const url = new URL(rawUrl);

  return Number(url.searchParams.get('PageNumber'));
};

export const suite = defineSuite('documentosApi', [
  test('acepta campos legacy nulos de cabecera cuando no son utilizados por la UI', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          code: '00',
          message: 'OK',
          messageUser: 'OK',
          statusCode: 200,
          pageNumber: 0,
          pageSize: 0,
          totalRecords: 0,
          totalPages: 0,
          response: [
            {
              idCabeceraPantalla: 10,
              tituloCabeceraPantalla: 'Documento',
              tipoDato: 'TEXT',
              operaTotal: null,
              compromiso: null,
              orden: 1,
              pantalla: 1,
              alineacionHtml: null,
              nId_Contrato: 182,
              nId_Cliente: 95,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }
      );

    try {
      const result = await fetchColumnas({
        idCliente: '95',
        idContrato: '182',
      });

      assert.deepEqual(result, [
        {
          key: 'dyn_0',
          label: 'Documento',
          type: 'text',
        },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('recupera todas las páginas cuando la API informa más de una', async () => {
    const originalFetch = globalThis.fetch;
    const requestedPages: number[] = [];

    globalThis.fetch = async (input) => {
      const pageNumber = getPageNumberFromRequest(input);
      requestedPages.push(pageNumber);

      return new Response(
        JSON.stringify(
          createPaginatedResponse(
            pageNumber,
            3,
            [pageNumber]
          )
        ),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }
      );
    };

    try {
      const data = await fetchAllGestiones({
        idCliente: '95',
        idCartera: '156',
        idDeudor: '3001',
      });

      assert.deepEqual(
        data.map((item) => item.nId_DocxCobrar),
        [1, 2, 3]
      );
      assert.deepEqual(requestedPages, [1, 2, 3]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('no realiza requests adicionales cuando existe una sola página', async () => {
    const originalFetch = globalThis.fetch;
    let requestCount = 0;

    globalThis.fetch = async (input) => {
      requestCount += 1;
      const pageNumber = getPageNumberFromRequest(input);

      return new Response(
        JSON.stringify(
          createPaginatedResponse(
            pageNumber,
            1,
            [10, 11]
          )
        ),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }
      );
    };

    try {
      const data = await fetchAllGestiones({
        idCliente: '95',
        idCartera: '156',
        idDeudor: '3001',
      });

      assert.equal(requestCount, 1);
      assert.deepEqual(
        data.map((item) => item.nId_DocxCobrar),
        [10, 11]
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('propaga el AbortSignal a cada request de documentos', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const receivedSignals: Array<AbortSignal | null | undefined> = [];

    globalThis.fetch = async (input, init) => {
      receivedSignals.push(init?.signal);
      const pageNumber = getPageNumberFromRequest(input);

      return new Response(
        JSON.stringify(
          createPaginatedResponse(
            pageNumber,
            2,
            [pageNumber]
          )
        ),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }
      );
    };

    try {
      await fetchAllGestiones(
        {
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
        },
        controller.signal
      );

      assert.equal(receivedSignals.length, 2);
      assert.ok(
        receivedSignals.every(
          (signal) => signal === controller.signal
        )
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
]);
