import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { fetchPagosByDeudor } from './pagosApi';

const createEnvelope = (response: unknown) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  pageNumber: 1,
  pageSize: 1000,
  totalRecords: Array.isArray(response) ? response.length : 0,
  totalPages: 1,
  response,
});

const getRequestUrl = (input: string | URL | Request) =>
  new URL(
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url
  );

export const suite = defineSuite('pagosApi', [
  test('envía parámetros y propaga AbortSignal', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const capturedUrls: URL[] = [];
    let capturedSignal: AbortSignal | null | undefined;

    globalThis.fetch = async (input, init) => {
      capturedUrls.push(getRequestUrl(input));
      capturedSignal = init?.signal;
      return new Response(JSON.stringify(createEnvelope([])), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };

    try {
      await fetchPagosByDeudor(
        { idCliente: '95', idCartera: '156', idDeudor: '3001' },
        controller.signal
      );

      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.searchParams.get('nId_Cliente'), '95');
      assert.equal(capturedUrl.searchParams.get('nId_Cartera'), '156');
      assert.equal(capturedUrl.searchParams.get('nId_Persdeudor'), '3001');
      assert.equal(capturedUrl.searchParams.get('PageNumber'), '1');
      assert.equal(capturedUrl.searchParams.get('PageSize'), '1000');
      assert.equal(capturedSignal, controller.signal);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('normaliza textos vacíos y monto nulo-compatible a defaults de dominio', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify(
          createEnvelope([
            {
              nro: 1,
              codigoCliente: '',
              nroDocumento: '',
              fechaPago: '',
              montoPago: 0,
              moneda: '',
              zona: '',
              notaCredito: '',
              marca: '',
            },
          ])
        ),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );

    try {
      const result = await fetchPagosByDeudor({
        idCliente: '95',
        idCartera: '156',
        idDeudor: '3001',
      });

      assert.deepEqual(result, [
        {
          nro: 1,
          codigoCliente: '—',
          nroDocumento: '—',
          fechaPago: '—',
          montoPago: 0,
          moneda: '—',
          zona: '—',
          notaCredito: '—',
          marca: '—',
        },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('rechaza pagos con contrato runtime inválido', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify(
          createEnvelope([
            {
              nro: 1,
              codigoCliente: 'C1',
              nroDocumento: 'D1',
              fechaPago: '2026-08-28',
              montoPago: null,
              moneda: 'PEN',
              zona: 'LIMA',
              notaCredito: '',
              marca: 'PAGADO',
            },
          ])
        ),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );

    try {
      await assert.rejects(
        fetchPagosByDeudor({
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
        }),
        /respuesta del servidor no contiene datos válidos/i
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
]);
